-- Run once in the Supabase SQL Editor: lets /admin choose whether a member is on the
-- executive board or a team lead. Existing members are sorted by their current title,
-- matching how the Members page grouped them before.

alter table team_members
  add column if not exists team_group text not null default 'leads'
  check (team_group in ('exec', 'leads'));

update team_members set team_group = 'exec'
  where title ~* '(president|treasurer|secretary|chair)';
