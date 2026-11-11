export type TimePeriod = '7day' | '1month' | '3month' | '6month' | '12month' | 'overall';

export interface LastFmImage {
  size: 'small' | 'medium' | 'large' | 'extralarge' | 'mega' | '';
  '#text': string;
}

export interface LastFmUser {
  name: string;
  realname: string;
  url: string;
  image: LastFmImage[];
  country: string;
  age: string;
  gender: string;
  subscriber: string;
  playcount: string;
  playlists: string;
  bootstrap: string;
  registered: {
    unixtime: string;
    '#text': number | string;
  };
  artist_count?: string;
  album_count?: string;
  track_count?: string;
}

export interface LastFmAlbum {
  name: string;
  playcount: string;
  mbid?: string;
  url: string;
  artist: {
    name: string;
    mbid?: string;
    url: string;
  };
  image: LastFmImage[];
  '@attr'?: {
    rank: string;
  };
}

export interface LastFmArtist {
  name: string;
  playcount: string;
  mbid?: string;
  url: string;
  streamable?: string;
  image: LastFmImage[];
  '@attr'?: {
    rank: string;
  };
}

export interface LastFmTrack {
  name: string;
  playcount: string;
  mbid?: string;
  url: string;
  duration?: string;
  artist: {
    name: string;
    mbid?: string;
    url: string;
  };
  image: LastFmImage[];
  '@attr'?: {
    rank: string;
  };
}

export interface LastFmRecentTrack {
  name: string;
  mbid?: string;
  url: string;
  artist: {
    mbid?: string;
    '#text': string;
  };
  album: {
    mbid?: string;
    '#text': string;
  };
  image: LastFmImage[];
  date?: {
    uts: string;
    '#text': string;
  };
  '@attr'?: {
    nowplaying?: string;
  };
}

export interface CollageSettings {
  period: TimePeriod;
  gridRows: number;
  gridCols: number;
  showTitles: boolean;
  showPlaycounts: boolean;
  showRanks: boolean;
  gap: number; // in pixels
  style: 'classic' | 'minimal' | 'glass';
}
