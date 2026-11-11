import React from 'react';
import { LastFmRecentTrack } from '../types/lastfm';
import { History, Disc3, ExternalLink, Radio, Loader2 } from 'lucide-react';

interface RecentTracksFeedProps {
  tracks: LastFmRecentTrack[];
  loading: boolean;
}

export const RecentTracksFeed: React.FC<RecentTracksFeedProps> = ({ tracks, loading }) => {
  const formatTime = (uts?: string) => {
    if (!uts) return '';
    const date = new Date(parseInt(uts, 10) * 1000);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  };

  if (loading && tracks.length === 0) {
    return (
      <div className="neu-card p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-lastfm-red animate-spin" />
        <span className="text-xs text-neutral-400">Lade Verlauf...</span>
      </div>
    );
  }

  return (
    <div className="neu-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-lastfm-red" />
          <h3 className="font-extrabold text-white text-xl tracking-tight">
            Kürzlich gehörte Titel
          </h3>
        </div>
        <span className="text-xs text-neutral-400 font-mono">Letzte {tracks.length} Scrobbles</span>
      </div>

      <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-2">
        {tracks.map((track, idx) => {
          const isNowPlaying = track['@attr']?.nowplaying === 'true';
          const cover =
            track.image?.find((i) => i.size === 'medium')?.['#text'] ||
            track.image?.[0]?.['#text'];

          return (
            <div
              key={`${track.name}-${idx}-${track.date?.uts || 'now'}`}
              className={`neu-card-sm p-3 flex items-center justify-between gap-3 text-xs transition-colors ${
                isNowPlaying ? 'border-lastfm-red/30 bg-lastfm-red/[0.04]' : 'hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  {cover ? (
                    <img
                      src={cover}
                      alt={track.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                      <Disc3 className="w-5 h-5 text-neutral-500" />
                    </div>
                  )}
                  {isNowPlaying && (
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-lastfm-red rounded-full border-2 border-[#1c1d22] animate-pulse"></span>
                  )}
                </div>

                <div className="min-w-0">
                  <a
                    href={track.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-white hover:text-lastfm-red transition-colors truncate block flex items-center gap-1"
                  >
                    <span className="truncate">{track.name}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 hover:opacity-100 shrink-0" />
                  </a>
                  <div className="text-neutral-400 truncate">
                    <span>{track.artist['#text']}</span>
                    {track.album?.['#text'] && (
                      <span className="text-neutral-500"> • {track.album['#text']}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                {isNowPlaying ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-lastfm-red bg-lastfm-red/10 px-2 py-0.5 rounded-full border border-lastfm-red/30">
                    <Radio className="w-3 h-3 animate-pulse" />
                    Spielt gerade
                  </span>
                ) : (
                  <span className="text-neutral-400 font-mono text-[11px]">
                    {formatTime(track.date?.uts)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
