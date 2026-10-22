export interface Event {
  id: string;
  title: string;
  description: string;
  date: string | null; // YYYY-MM-DD
  time: string;
  location: string;
  capacity: string;
  tag: string;
  is_past: boolean;
  rsvp_url: string;
  sort_order: number;
}

export type TeamGroup = 'exec' | 'leads';

export const TEAM_GROUP_LABELS: Record<TeamGroup, string> = {
  exec: 'Executive board',
  leads: 'Team leads',
};

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  team_group: TeamGroup;
  linkedin: string;
  photo_url: string | null;
  sort_order: number;
}

export interface GalleryAlbum {
  id: string;
  event_id: string | null;
  label: string;
  date: string | null; // YYYY-MM-DD
  cover_image_url: string | null;
  sort_order: number;
}

export interface GalleryPhoto {
  id: string;
  album_id: string;
  image_url: string;
  caption: string;
  sort_order: number;
}

export const TAG_COLORS: Record<string, string> = {
  Workshop: 'text-blue-400 border-blue-400/40',
  'Study Group': 'text-green-400 border-green-400/40',
  Speaker: 'text-purple-400 border-purple-400/40',
  Hackathon: 'text-[#FF9900] border-[#FF9900]/40',
  Career: 'text-yellow-400 border-yellow-400/40',
  Other: 'text-gray-400 border-gray-400/40',
};

export const TAG_OPTIONS = Object.keys(TAG_COLORS);
