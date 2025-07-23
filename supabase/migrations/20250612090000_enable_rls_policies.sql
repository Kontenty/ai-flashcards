-- migration: enable rls policies for flashcards, tags, and flashcard_tags
-- created at: 2025-06-12 09:00:00 UTC
-- this migration re-enables row level security and defines policies
-- to ensure users can only access their own data.

--
-- flashcards table policies
--

-- 1. enable row level security on the flashcards table
alter table public.flashcards enable row level security;

-- 2. allow authenticated users to select their own flashcards
create policy select_own_flashcards on public.flashcards
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- 3. allow authenticated users to insert their own flashcards
create policy insert_own_flashcards on public.flashcards
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- 4. allow authenticated users to update their own flashcards
create policy update_own_flashcards on public.flashcards
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 5. allow authenticated users to delete their own flashcards
create policy delete_own_flashcards on public.flashcards
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

--
-- tags table policies
--

-- 1. enable row level security on the tags table
alter table public.tags enable row level security;

-- 2. allow authenticated users to select their own tags
create policy select_own_tags on public.tags
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- 3. allow authenticated users to insert their own tags
create policy insert_own_tags on public.tags
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- 4. allow authenticated users to delete their own tags
-- note: update is not included as tags are typically simple and can be deleted/re-created.
create policy delete_own_tags on public.tags
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);


--
-- flashcard_tags table policies
--

-- 1. enable row level security on the flashcard_tags table
alter table public.flashcard_tags enable row level security;

-- 2. allow authenticated users to select tags for their own flashcards
create policy select_own_flashcard_tags on public.flashcard_tags
  for select
  to authenticated
  using (
    exists (
      select 1 from public.flashcards
      where flashcards.id = flashcard_tags.flashcard_id
      and flashcards.user_id = (select auth.uid())
    )
  );

-- 3. allow authenticated users to insert tags for their own flashcards
create policy insert_own_flashcard_tags on public.flashcard_tags
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.flashcards
      where flashcards.id = flashcard_tags.flashcard_id
      and flashcards.user_id = (select auth.uid())
    )
    and
    exists (
      select 1 from public.tags
      where tags.id = flashcard_tags.tag_id
      and tags.user_id = (select auth.uid())
    )
  );

-- 4. allow authenticated users to delete tags from their own flashcards
create policy delete_own_flashcard_tags on public.flashcard_tags
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.flashcards
      where flashcards.id = flashcard_tags.flashcard_id
      and flashcards.user_id = (select auth.uid())
    )
  ); 