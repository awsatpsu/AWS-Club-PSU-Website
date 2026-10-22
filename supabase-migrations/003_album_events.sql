-- Run once in the Supabase SQL Editor: ties each photo album to the event it was taken at.
-- Existing albums start unlinked; pick their event in /admin → Gallery → edit album.
-- Deleting an event keeps its photos; the album just becomes unlinked.

alter table gallery_albums
  add column if not exists event_id uuid references events(id) on delete set null;

-- One album per event.
create unique index if not exists gallery_albums_event_id_key on gallery_albums(event_id);
