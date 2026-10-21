import { supabase } from './supabase';
import type { Event, TeamMember, GalleryAlbum, GalleryPhoto } from './types';
import { todayISO } from './date';

export interface AlbumWithCount extends GalleryAlbum {
  photo_count: number;
}

type AlbumRow = GalleryAlbum & { gallery_photos?: { count: number }[] };

const toAlbum = ({ gallery_photos, ...album }: AlbumRow): AlbumWithCount => ({
  ...album,
  photo_count: gallery_photos?.[0]?.count ?? 0,
});

export async function fetchAlbums(limit?: number): Promise<AlbumWithCount[]> {
  let query = supabase
    .from('gallery_albums')
    .select('*, gallery_photos(count)')
    .order('date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data } = await query;
  return ((data ?? []) as AlbumRow[]).map(toAlbum);
}

export async function fetchAlbum(id: string): Promise<AlbumWithCount | null> {
  const { data } = await supabase
    .from('gallery_albums')
    .select('*, gallery_photos(count)')
    .eq('id', id)
    .maybeSingle();
  return data ? toAlbum(data as AlbumRow) : null;
}

export async function fetchPhotos(albumId: string): Promise<GalleryPhoto[]> {
  const { data } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('album_id', albumId)
    .order('sort_order')
    .order('created_at');
  return data ?? [];
}

export async function fetchTeam(): Promise<TeamMember[]> {
  const { data } = await supabase
    .from('team_members')
    .select('*')
    .order('sort_order')
    .order('created_at');
  return data ?? [];
}

// Soonest first; an event drops off once its date has passed, even if not marked past.
export async function fetchUpcomingEvents(): Promise<Event[]> {
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('is_past', false)
    .or(`date.is.null,date.gte.${todayISO()}`)
    .order('date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });
  return data ?? [];
}
