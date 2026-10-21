-- Run once in the Supabase SQL Editor on a project created before event dates became real dates.
-- Values already written as YYYY-MM-DD are kept; anything else (e.g. "April 12, 2026") is cleared,
-- so re-pick those dates in /admin afterwards.

alter table events
  alter column date drop default,
  alter column date type date using (
    case when date ~ '^\d{4}-\d{2}-\d{2}$' then date::date else null end
  );
