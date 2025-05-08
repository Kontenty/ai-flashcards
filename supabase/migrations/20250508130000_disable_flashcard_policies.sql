-- migration: disable RLS policies for flashcards and related tag tables
-- created at: 2025-05-08 13:00:00 UTC

-- disable RLS and drop policies on flashcards
alter table public.flashcards disable row level security;
drop policy if exists select_flashcards on public.flashcards;
drop policy if exists insert_flashcards on public.flashcards;
drop policy if exists update_flashcards on public.flashcards;
drop policy if exists delete_flashcards on public.flashcards;

-- disable RLS and drop policies on flashcard_tags
alter table public.flashcard_tags disable row level security;
drop policy if exists select_flashcard_tags on public.flashcard_tags;
drop policy if exists insert_flashcard_tags on public.flashcard_tags;
drop policy if exists delete_flashcard_tags on public.flashcard_tags;

-- disable RLS on tags table (no policies defined originally)
alter table public.tags disable row level security; 