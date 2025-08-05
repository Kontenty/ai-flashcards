-- migration_metadata:
--   purpose: update daily_review_stats view to include all dates from Monday to Sunday of the current week, with nulls for days with no reviews.
--   affected_views:
--     - public.daily_review_stats (replaced)
--   special_considerations:
--     - this migration ensures the view returns all days from Monday to Sunday of the current week, with nulls for days with no reviews.

-- update the daily_review_stats view to include all dates from Monday to Sunday of the current week
create or replace view public.daily_review_stats as
with week_dates as (
    select generate_series(
        date_trunc('week', current_date) + interval '0 days', -- Monday
        date_trunc('week', current_date) + interval '6 days', -- Sunday
        interval '1 day'
    )::date as review_date
),
review_stats as (
    select
        date(reviewed_at) as review_date,
        count(id) as cards_reviewed,
        round(avg(quality), 2) as mean_quality
    from
        public.flashcard_reviews
    where
        reviewed_at >= date_trunc('week', current_date) + interval '0 days'
        and reviewed_at < date_trunc('week', current_date) + interval '7 days'
    group by
        date(reviewed_at)
)
select
    w.review_date,
    r.cards_reviewed,
    r.mean_quality
from week_dates w
left join review_stats r on w.review_date = r.review_date
order by w.review_date;

grant select on public.daily_review_stats to authenticated;
