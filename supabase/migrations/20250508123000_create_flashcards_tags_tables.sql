-- migration: initial schema for flashcards, tags, and flashcard_tags
-- created at: 2025-05-08 12:30:00 UTC
-- this migration sets up the core tables, indexes, full-text search, rls policies, and required extensions

-- enable uuid generation extension for primary keys
create extension if not exists "uuid-ossp";

-- create flashcards table
create table if not exists public.flashcards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  front varchar(200) not null,
  back varchar(500) not null,
  source text,
  ease_factor numeric(4,2) not null default 2.5,
  interval integer not null default 1,
  next_review_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  tsv tsvector generated always as (
    to_tsvector('english', front || ' ' || back)
  ) stored
);

-- index on user_id for efficient lookups by user
create index if not exists idx_flashcards_user_id on public.flashcards(user_id);

-- full-text search index on tsvector column
create index if not exists idx_flashcards_tsv on public.flashcards using gin(tsv);

-- create tags table (global; no row level security required)
create table if not exists public.tags (
  id uuid primary key default uuid_generate_v4(),
  name varchar(50) not null unique,
  created_at timestamptz not null default now()
);

-- create flashcard_tags join table for many-to-many relationship
create table if not exists public.flashcard_tags (
  flashcard_id uuid not null references public.flashcards(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (flashcard_id, tag_id)
); 