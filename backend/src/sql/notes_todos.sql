-- Notes table
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  user_id uuid not null,
  title text,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notes_family on public.notes(family_id);

-- Todos table
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  user_id uuid not null,
  title text not null,
  description text,
  is_completed boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_todos_family on public.todos(family_id);


