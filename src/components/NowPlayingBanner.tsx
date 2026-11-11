import React from 'react';
import { LastFmRecentTrack } from '../types/lastfm';
import { Radio, ExternalLink, Disc3, Clock } from 'lucide-react';

interface NowPlayingBannerProps {
  nowPlaying: LastFmRecentTrack | null;
  lastScrobbled: LastFmRecentTrack | null;
}

export const NowPlayingBanner: React.FC<NowPlayingBannerProps> = ({
  nowPlaying,
  lastScrobbled,
}) => {
  const current = nowPlaying || lastScrobbled;
  if (!current) return null;

  const isLive = Boolean(nowPlaying);
  const albumCover =
    current.image?.find((i) => i.size === 'large' || i.size === 'extralarge')?.['#text'] ||
    current.image?.[current.image.length - 1]?.['#text'] ||
    '';

  const formatRelativeTime = (uts?: string) => {
    if (!uts) return '';
    const diff = Math.floor(Date.now() / 1000 - parseInt(uts, 10));
    if (diff < 60) return 'gerade eben';
    if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min.`;
    if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std.`;
    return `vor ${Math.floor(diff / 86400)} Tagen`;
  };

  return (
    <div className="neu-card p-4 sm:p-5 relative overflow-hidden group">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Indicator & Track Details */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Album artwork */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-xl overflow-hidden neu-inset p-1">
              {albumCover ? (
                <img
                  src={albumCover}
                  alt={current.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-neutral-800 rounded-lg flex items-center justify-center">
                  <Disc3 className="w-8 h-8 text-neutral-500 animate-spin" />
                </div>
              )}
            </div>

            {/* Status dot */}
            {isLive ? (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lastfm-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-lastfm-red border-2 border-[#1c1d22]"></span>
              </span>
            ) : null}
          </div>

          {/* Titles */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-lastfm-red/15 text-lastfm-red border border-lastfm-red/30 uppercase tracking-wider">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Now Playing
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-neutral-400 border border-white/5">
                  <Clock className="w-3 h-3" />
                  Zuletzt gehört {formatRelativeTime(current.date?.uts)}
                </span>
              )}

              {/* Equalizer Waveform bars if live */}
              {isLive && (
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-lastfm-red animate-[pulse_0.8s_ease-in-out_infinite] h-full rounded-full"></span>
                  <span className="w-0.5 bg-lastfm-red animate-[pulse_1.1s_ease-in-out_infinite] h-2 rounded-full"></span>
                  <span className="w-0.5 bg-lastfm-red animate-[pulse_0.6s_ease-in-out_infinite] h-3 rounded-full"></span>
                  <span className="w-0.5 bg-lastfm-red animate-[pulse_0.9s_ease-in-out_infinite] h-1.5 rounded-full"></span>
                </div>
              )}
            </div>

            <h3 className="text-white font-bold text-base truncate tracking-tight">
              {current.name}
            </h3>
            <p className="text-neutral-400 text-xs truncate font-medium">
              <span className="text-neutral-200">{current.artist['#text']}</span>
              {current.album?.['#text'] && (
                <span className="text-neutral-500 font-normal"> — {current.album['#text']}</span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Last.fm Link */}
        <a
          href={current.url}
          target="_blank"
          rel="noreferrer"
          className="neu-button px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-center"
        >
          <span>Auf Last.fm ansehen</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </a>
      </div>
    </div>
  );
};
