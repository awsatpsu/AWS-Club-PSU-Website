-- Run once in the Supabase SQL Editor: the team page is executive board only,
-- so members no longer have a group. Undoes 004_member_groups.sql.

alter table team_members drop column if exists team_group;
