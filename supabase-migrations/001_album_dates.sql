-- Run once in the Supabase SQL Editor on a project created before album dates became real dates.
-- Values already written as YYYY-MM-DD are kept; anything else (e.g. "Feb 2026") is cleared,
-- so re-pick those dates in /admin afterwards.

alter table gallery_albums
  alter column date drop default,
  alter column date type date using (
    case when date ~ '^\d{4}-\d{2}-\d{2}$' then date::date else null end
  );
