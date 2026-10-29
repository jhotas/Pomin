-- Accounts and sync: skills and sessions mirrored from the browser.
--
-- The browser keeps its own copy in IndexedDB and stays the source the app
-- reads. These tables hold each account's copy. `updated_at` is set by the
-- client and decides conflicts (last write wins); `synced_at` is set here and
-- is the cursor clients pull from, so client clocks never decide what a pull
-- misses.

create table public.skills (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  target_hours integer not null default 10000 check (target_hours > 0),
  archived_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  synced_at timestamptz not null default now(),
  unique (user_id, id)
);

create table public.sessions (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  skill_id uuid not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  focused_seconds integer not null check (focused_seconds >= 0),
  planned_seconds integer not null check (planned_seconds > 0),
  outcome text not null check (outcome in ('completed', 'interrupted')),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  synced_at timestamptz not null default now(),
  check (ended_at >= started_at),
  -- A session can only belong to a skill of the same account.
  foreign key (user_id, skill_id) references public.skills (user_id, id)
);

create index skills_user_synced_at on public.skills (user_id, synced_at);
create index sessions_user_synced_at on public.sessions (user_id, synced_at);
create index sessions_user_skill on public.sessions (user_id, skill_id);

-- Every account reads and writes only its own rows.
alter table public.skills enable row level security;
alter table public.sessions enable row level security;

create policy "Accounts manage their own skills"
  on public.skills for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Accounts manage their own sessions"
  on public.sessions for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- The server stamps every write, whatever the client sends.
create function public.stamp_synced_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.synced_at := now();
  return new;
end;
$$;

create trigger skills_stamp_synced_at
  before insert or update on public.skills
  for each row execute function public.stamp_synced_at();

create trigger sessions_stamp_synced_at
  before insert or update on public.sessions
  for each row execute function public.stamp_synced_at();

-- Upserts a batch of local changes. A row only replaces the stored one when it
-- was written later, so an older copy from another device never wins. It runs
-- as the caller, so row-level security applies.
create function public.push_changes(p_skills jsonb, p_sessions jsonb)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.skills
    (id, name, target_hours, archived_at, created_at, updated_at, deleted_at)
  select id, name, target_hours, archived_at, created_at, updated_at, deleted_at
  from jsonb_to_recordset(p_skills) as r (
    id uuid,
    name text,
    target_hours integer,
    archived_at timestamptz,
    created_at timestamptz,
    updated_at timestamptz,
    deleted_at timestamptz
  )
  on conflict (id) do update set
    name = excluded.name,
    target_hours = excluded.target_hours,
    archived_at = excluded.archived_at,
    updated_at = excluded.updated_at,
    deleted_at = excluded.deleted_at
  where public.skills.updated_at < excluded.updated_at;

  insert into public.sessions
    (id, skill_id, started_at, ended_at, focused_seconds, planned_seconds,
     outcome, created_at, updated_at, deleted_at)
  select id, skill_id, started_at, ended_at, focused_seconds, planned_seconds,
    outcome, created_at, updated_at, deleted_at
  from jsonb_to_recordset(p_sessions) as r (
    id uuid,
    skill_id uuid,
    started_at timestamptz,
    ended_at timestamptz,
    focused_seconds integer,
    planned_seconds integer,
    outcome text,
    created_at timestamptz,
    updated_at timestamptz,
    deleted_at timestamptz
  )
  on conflict (id) do update set
    skill_id = excluded.skill_id,
    started_at = excluded.started_at,
    ended_at = excluded.ended_at,
    focused_seconds = excluded.focused_seconds,
    planned_seconds = excluded.planned_seconds,
    outcome = excluded.outcome,
    updated_at = excluded.updated_at,
    deleted_at = excluded.deleted_at
  where public.sessions.updated_at < excluded.updated_at;
$$;

revoke execute on function public.push_changes(jsonb, jsonb) from public, anon;
grant execute on function public.push_changes(jsonb, jsonb) to authenticated;

-- Returns the account's rows stamped since the last pull, in one snapshot.
-- `synced_at` is a transaction's start time, so a write that commits a moment
-- after a pull can carry an earlier stamp; re-reading the minute before the
-- cursor catches it. Rows read twice are harmless: clients keep the later
-- `updated_at`.
create function public.pull_changes(p_since timestamptz)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'pulled_at', now(),
    'skills', coalesce((
      select jsonb_agg(to_jsonb(s) - 'user_id' - 'synced_at')
      from public.skills s
      where s.user_id = (select auth.uid())
        and (p_since is null or s.synced_at > p_since - interval '1 minute')
    ), '[]'::jsonb),
    'sessions', coalesce((
      select jsonb_agg(to_jsonb(s) - 'user_id' - 'synced_at')
      from public.sessions s
      where s.user_id = (select auth.uid())
        and (p_since is null or s.synced_at > p_since - interval '1 minute')
    ), '[]'::jsonb)
  );
$$;

revoke execute on function public.pull_changes(timestamptz) from public, anon;
grant execute on function public.pull_changes(timestamptz) to authenticated;
