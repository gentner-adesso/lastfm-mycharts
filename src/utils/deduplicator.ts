import { LastFmImage } from '../types/lastfm';

export interface DeduplicatableItem {
  name: string;
  artist: {
    name: string;
    mbid?: string;
    url?: string;
  };
  image: LastFmImage[];
  playcount: string;
  url?: string;
  mbid?: string;
  '@attr'?: {
    rank: string;
  };
}

export function normalizeKey(artistName: string, title: string): string {
  const cleanArtist = artistName
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

  let cleanTitle = title.trim().toLowerCase();

  // 1. Remove bracketed / parenthesized metadata tags
  cleanTitle = cleanTitle
    .replace(/\[(explicit|clean|deluxe|remastered|bonus.*|expanded.*|special.*|anniversary.*)\]/gi, '')
    .replace(/\((explicit|clean|deluxe|remastered|bonus.*|expanded.*|special.*|anniversary.*)\)/gi, '')
    .replace(/-(remastered.*|deluxe.*|bonus.*)/gi, '');

  // 2. Normalize German umlauts to ae/oe/ue/ss
  cleanTitle = cleanTitle
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');

  // 3. Strip accents / diacritics
  cleanTitle = cleanTitle.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 4. Strip punctuation and multiple spaces
  cleanTitle = cleanTitle.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  return `${cleanArtist}:::${cleanTitle}`;
}

export function deduplicateItems<T extends DeduplicatableItem>(items: T[]): T[] {
  const map = new Map<string, T>();

  for (const item of items) {
    if (!item || !item.name) continue;

    const key = normalizeKey(item.artist.name, item.name);
    const existing = map.get(key);

    if (!existing) {
      // Clone item so we don't mutate original
      map.set(key, { ...item });
    } else {
      // Sum playcounts
      const existingPlays = parseInt(existing.playcount || '0', 10);
      const currentPlays = parseInt(item.playcount || '0', 10);
      existing.playcount = String(existingPlays + currentPlays);

      // Prefer title without [Explicit] or with proper umlauts
      const hasUmlauts = /[äöüßÄÖÜ]/.test(item.name);
      const existingHasUmlauts = /[äöüßÄÖÜ]/.test(existing.name);
      const isExplicitTag = /\[explicit\]|\(explicit\)/i.test(existing.name);
      const itemIsExplicit = /\[explicit\]|\(explicit\)/i.test(item.name);

      if (isExplicitTag && !itemIsExplicit) {
        existing.name = item.name;
      } else if (!existingHasUmlauts && hasUmlauts) {
        existing.name = item.name;
      }

      // Prefer item with better artwork if existing has empty artwork
      const existingImg = existing.image?.find((i) => i['#text'])?.['#text'];
      const currentImg = item.image?.find((i) => i['#text'])?.['#text'];
      if (!existingImg && currentImg) {
        existing.image = item.image;
      }
    }
  }

  // Convert map values to array and sort descending by total playcount
  const result = Array.from(map.values()).sort((a, b) => {
    return parseInt(b.playcount || '0', 10) - parseInt(a.playcount || '0', 10);
  });

  // Re-assign rank numbers
  result.forEach((item, idx) => {
    item['@attr'] = { rank: String(idx + 1) };
  });

  return result;
}
