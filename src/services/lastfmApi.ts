import {
  LastFmAlbum,
  LastFmArtist,
  LastFmRecentTrack,
  LastFmTrack,
  LastFmUser,
  TimePeriod,
} from '../types/lastfm';

const ENV_API_KEY = import.meta.env.VITE_LASTFM_API_KEY || '';
const ENV_USER = import.meta.env.VITE_LASTFM_USER || 'Sebastiangentner';
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

export const getStoredApiKey = (): string => {
  return ENV_API_KEY;
};

export const getStoredUsername = (): string => {
  return localStorage.getItem('lastfm_username') || ENV_USER;
};

export const setStoredUsername = (user: string): void => {
  localStorage.setItem('lastfm_username', user.trim());
};

async function fetchFromLastFm(params: Record<string, string | number>): Promise<any> {
  const apiKey = getStoredApiKey();
  const query = new URLSearchParams({
    api_key: apiKey,
    format: 'json',
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ),
  });

  const response = await fetch(`${BASE_URL}?${query.toString()}`);
  if (!response.ok) {
    throw new Error(`Last.fm API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.message || `Last.fm Error Code ${data.error}`);
  }

  return data;
}

export async function getUserInfo(username?: string): Promise<LastFmUser> {
  const user = username || getStoredUsername();
  const data = await fetchFromLastFm({
    method: 'user.getinfo',
    user,
  });
  return data.user;
}

export async function getRecentTracks(
  username?: string,
  limit: number = 20
): Promise<{ tracks: LastFmRecentTrack[]; total: number; nowPlaying: LastFmRecentTrack | null }> {
  const user = username || getStoredUsername();
  const data = await fetchFromLastFm({
    method: 'user.getrecenttracks',
    user,
    limit,
    extended: 1,
  });

  const rawTracks = data.recenttracks?.track;
  const list: LastFmRecentTrack[] = Array.isArray(rawTracks)
    ? rawTracks
    : rawTracks
    ? [rawTracks]
    : [];

  const nowPlaying = list.find((t) => t['@attr']?.nowplaying === 'true') || null;
  const total = parseInt(data.recenttracks?.['@attr']?.total || '0', 10);

  return { tracks: list, total, nowPlaying };
}

export async function getTopAlbums(
  period: TimePeriod = 'overall',
  limit: number = 50,
  username?: string
): Promise<LastFmAlbum[]> {
  const user = username || getStoredUsername();
  const data = await fetchFromLastFm({
    method: 'user.gettopalbums',
    user,
    period,
    limit,
  });

  const raw = data.topalbums?.album;
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
}

export async function getTopArtists(
  period: TimePeriod = 'overall',
  limit: number = 50,
  username?: string
): Promise<LastFmArtist[]> {
  const user = username || getStoredUsername();
  const data = await fetchFromLastFm({
    method: 'user.gettopartists',
    user,
    period,
    limit,
  });

  const raw = data.topartists?.artist;
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
}

export async function getTopTracks(
  period: TimePeriod = 'overall',
  limit: number = 50,
  username?: string
): Promise<LastFmTrack[]> {
  const user = username || getStoredUsername();
  const data = await fetchFromLastFm({
    method: 'user.gettoptracks',
    user,
    period,
    limit,
  });

  const raw = data.toptracks?.track;
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
}
