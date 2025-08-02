-- migration_metadata:
--   purpose: implement flashcard review system with sm-2 algorithm.
--   affected_tables:
--     - public.flashcard_reviews (created)
--     - public.flashcards (updated by function)
--   affected_functions:
--     - public.process_flashcard_review (created)
--   affected_views:
--     - public.daily_review_stats (created)
--   special_considerations:
--     - this migration introduces the core logic for spaced repetition.
--     - the `flashcard_reviews` table is designed to be append-only to preserve review history.
--     - the `process_flashcard_review` function uses `security definer` to securely update card metadata.

-- create the table to store flashcard review history
create table public.flashcard_reviews (
    id uuid primary key default uuid_generate_v4(),
    flashcard_id uuid not null,
    user_id uuid not null,
    quality smallint not null check (quality >= 0 and quality <= 5),
    reviewed_at timestamptz not null default now(),
    interval integer not null,
    ease_factor numeric(4,2) not null,
    constraint fk_flashcard foreign key(flashcard_id) references public.flashcards(id) on delete cascade,
    constraint fk_user foreign key(user_id) references auth.users(id) on delete cascade
);

-- add comments to the columns for better understanding of the schema.
comment on table public.flashcard_reviews is 'stores the history of each flashcard review, forming the basis of the sm-2 algorithm.';
comment on column public.flashcard_reviews.quality is 'user-provided score for a review (0-5), where 5 is the best recall.';
comment on column public.flashcard_reviews.interval is 'the interval (in days) before the next review, calculated after this review.';
comment on column public.flashcard_reviews.ease_factor is 'the ease factor for the flashcard after this review, which influences the next interval.';

-- create indexes to optimize query performance, especially for rls and joins.
create index idx_flashcard_reviews_flashcard_id on public.flashcard_reviews(flashcard_id);
create index idx_flashcard_reviews_user_id on public.flashcard_reviews(user_id);

-- enable row level security on the `flashcard_reviews` table to protect user data.
alter table public.flashcard_reviews enable row level security;

-- create rls policies for the `flashcard_reviews` table.
-- users should only be able to see and create their own review entries.
-- the table is append-only, so no update or delete policies are created.

-- policy: allow authenticated users to select their own reviews.
create policy "select_own_reviews"
on public.flashcard_reviews for select
to authenticated
using (auth.uid() = user_id);

-- policy: allow authenticated users to insert their own reviews.
create policy "insert_own_reviews"
on public.flashcard_reviews for insert
to authenticated
with check (auth.uid() = user_id);

-- create the core function to process a flashcard review using the sm-2 algorithm.
-- this function calculates the new ease factor and interval, updates the flashcard,
-- and records the review in the `flashcard_reviews` table.
create or replace function public.process_flashcard_review(
  p_flashcard_id uuid,
  p_quality smallint
) returns void as $$
declare
  v_card public.flashcards%rowtype;
  v_new_interval integer;
  v_new_ef numeric(4,2);
begin
  -- ensure the quality score is within the valid range (0-5).
  if p_quality < 0 or p_quality > 5 then
    raise exception 'quality must be between 0 and 5';
  end if;

  -- retrieve the flashcard, ensuring it belongs to the currently authenticated user.
  select * into v_card from public.flashcards
  where id = p_flashcard_id and user_id = auth.uid();

  if not found then
    raise exception 'flashcard not found or access denied';
  end if;

  -- sm-2 algorithm implementation
  if p_quality < 3 then
    -- if the quality is low, reset the interval.
    v_new_interval := 1;
  else
    -- if the quality is good, calculate the next interval.
    if v_card.interval = 1 then
      v_new_interval := 6; -- first successful review
    else
      v_new_interval := ceil(v_card.interval * v_card.ease_factor);
    end if;
  end if;

  -- calculate the new ease factor. it must not be less than 1.3.
  v_new_ef := greatest(1.3, v_card.ease_factor + (0.1 - (5 - p_quality) * (0.08 + (5 - p_quality) * 0.02)));

  -- insert a record of the current review into the history table.
  insert into public.flashcard_reviews (
    flashcard_id, user_id, quality, reviewed_at,
    interval, ease_factor
  ) values (
    p_flashcard_id, auth.uid(), p_quality, now(),
    v_new_interval, v_new_ef
  );

  -- update the flashcard with the new sm-2 parameters.
  update public.flashcards
  set interval = v_new_interval,
      ease_factor = v_new_ef,
      next_review_date = current_date + v_new_interval,
      updated_at = now()
  where id = p_flashcard_id;
end;
$$ language plpgsql volatile security definer;

-- grant execute permissions on the function to authenticated users.
grant execute on function public.process_flashcard_review(uuid, smallint) to authenticated;

-- create a view to show daily review statistics for the current week.
-- this view is automatically protected by the rls policy on the underlying `flashcard_reviews` table.
create or replace view public.daily_review_stats as
select
    date(reviewed_at) as review_date,
    count(id) as cards_reviewed,
    round(avg(quality), 2) as mean_quality
from
    public.flashcard_reviews
where
    -- filter data for the current week, starting from monday.
    reviewed_at >= date_trunc('week', current_date)
group by
    date(reviewed_at)
order by
    review_date;

-- grant select permissions on the view to authenticated users.
grant select on public.daily_review_stats to authenticated;

