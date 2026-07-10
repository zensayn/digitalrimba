import { authedFetch, statusError } from '@/lib/api/invitations';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  category: string;
  src: string;
  duration_seconds?: number;
};

export async function fetchMusicTracks(): Promise<MusicTrack[]> {
  const res = await authedFetch(`${BASE}/api/music-tracks`);
  if (!res.ok) throw statusError('Music tracks fetch failed', res.status);
  const { tracks } = (await res.json()) as { tracks: MusicTrack[] };
  return tracks;
}
