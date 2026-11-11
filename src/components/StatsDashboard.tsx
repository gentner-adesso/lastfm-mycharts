import React, { useEffect, useState } from 'react';
import { LastFmArtist, LastFmTrack, LastFmUser, TimePeriod } from '../types/lastfm';
import { getTopArtists, getTopTracks } from '../services/lastfmApi';
import { useLanguage } from '../i18n/LanguageContext';
import {
  BarChart3,
  Mic2,
  Music,
  ExternalLink,
  Flame,
  TrendingUp,
  Percent,
  Loader2,
} from 'lucide-react';

interface StatsDashboardProps {
  user: LastFmUser | null;
}

const STATS_PERIOD_KEYS: TimePeriod[] = [
  '7day',
  '1month',
  '3month',
  '6month',
  '12month',
  'overall',
];

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ user }) => {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<TimePeriod>('overall');
  const [topArtists, setTopArtists] = useState<LastFmArtist[]>([]);
  const [topTracks, setTopTracks] = useState<LastFmTrack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [artists, tracks] = await Promise.all([
          getTopArtists(period, 15),
          getTopTracks(period, 15),
        ]);
        if (!isCancelled) {
          setTopArtists(artists);
          setTopTracks(tracks);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message || 'Error loading statistics');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchStats();
    return () => {
      isCancelled = true;
    };
  }, [period]);

  const maxArtistPlays = topArtists.length > 0 ? parseInt(topArtists[0].playcount, 10) : 1;
  const maxTrackPlays = topTracks.length > 0 ? parseInt(topTracks[0].playcount, 10) : 1;

  // Total scrobbles in top 10
  const top10ArtistPlays = topArtists.slice(0, 10).reduce((acc, a) => acc + parseInt(a.playcount, 10), 0);
  const userTotalPlays = parseInt(user?.playcount || '1', 10);
  const top10Dominance = ((top10ArtistPlays / userTotalPlays) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header & Period Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-lastfm-red/10 border border-lastfm-red/20 text-lastfm-red">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.stats.titlePrefix} <span className="text-lastfm-red">{t.stats.titleHighlight}</span>
            </h2>
          </div>
          <p className="text-sm text-neu-muted mt-1">
            {t.stats.subtitle}
          </p>
        </div>

        {/* Time Period Tabs */}
        <div className="neu-card p-1.5 flex flex-wrap gap-1 self-start md:self-auto">
          {STATS_PERIOD_KEYS.map((k) => {
            const active = period === k;
            return (
              <button
                key={k}
                onClick={() => setPeriod(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'neu-button-active text-lastfm-red border border-lastfm-red/40'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                {t.collage.periods[k]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cool Analytic Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="neu-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              {t.stats.topArtistDominance}
            </span>
            <Percent className="w-4 h-4 text-lastfm-red" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{top10Dominance}%</div>
          <p className="text-xs text-neutral-400 mt-1">
            {t.stats.topArtistDominanceDesc}
          </p>
        </div>

        <div className="neu-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              {t.stats.allTimeFavorite}
            </span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-white font-mono truncate">
            {topArtists[0]?.name || '—'}
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            {t.stats.allTimeFavoriteDesc.replace(
              '{count}',
              Number(topArtists[0]?.playcount || 0).toLocaleString()
            )}
          </p>
        </div>

        <div className="neu-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              {t.stats.mostPlayedTrack}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono truncate">
            {topTracks[0]?.name || '—'}
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            {t.stats.mostPlayedTrackDesc
              .replace('{artist}', topTracks[0]?.artist.name || '')
              .replace('{count}', String(topTracks[0]?.playcount || '0'))}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="neu-card p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-lastfm-red animate-spin" />
          <span className="text-xs text-neutral-400">{t.stats.loadingStats}</span>
        </div>
      ) : error ? (
        <div className="neu-card p-6 text-center text-red-300 text-sm">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Artists Column */}
          <div className="neu-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic2 className="w-4 h-4 text-lastfm-red" />
                <h3 className="font-extrabold text-white text-lg tracking-tight">
                  {t.stats.topArtists}
                </h3>
              </div>
              <span className="text-xs text-neutral-500 font-mono">Top {topArtists.length}</span>
            </div>

            <div className="space-y-3">
              {topArtists.map((artist, idx) => {
                const plays = parseInt(artist.playcount, 10);
                const percent = Math.round((plays / maxArtistPlays) * 100);

                return (
                  <div
                    key={`${artist.name}-${idx}`}
                    className="neu-card-sm p-3.5 relative overflow-hidden group hover:border-white/20 transition-colors"
                  >
                    {/* Background Progress Bar */}
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-lastfm-red/20 via-lastfm-red/10 to-transparent border-r-2 border-lastfm-red rounded-l-xl pointer-events-none transition-all duration-700"
                      style={{ width: `${percent}%` }}
                    />

                    <div className="relative z-10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                            idx === 0
                              ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                              : idx === 1
                              ? 'bg-neutral-300/20 text-neutral-200 border border-neutral-300/30'
                              : idx === 2
                              ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30'
                              : 'text-neutral-400 bg-black/40'
                          }`}
                        >
                          #{idx + 1}
                        </span>

                        <div className="min-w-0">
                          <a
                            href={artist.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-sm text-white group-hover:text-lastfm-red transition-colors truncate block flex items-center gap-1.5"
                          >
                            <span className="truncate">{artist.name}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </a>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-sm text-white">
                          {plays.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-neutral-400 block font-medium">
                          {t.stats.scrobbles}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Tracks Column */}
          <div className="neu-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-lastfm-red" />
                <h3 className="font-extrabold text-white text-lg tracking-tight">
                  {t.stats.topTracks}
                </h3>
              </div>
              <span className="text-xs text-neutral-500 font-mono">Top {topTracks.length}</span>
            </div>

            <div className="space-y-3">
              {topTracks.map((track, idx) => {
                const plays = parseInt(track.playcount, 10);
                const percent = Math.round((plays / maxTrackPlays) * 100);

                return (
                  <div
                    key={`${track.name}-${idx}`}
                    className="neu-card-sm p-3.5 relative overflow-hidden group hover:border-white/20 transition-colors"
                  >
                    {/* Background Progress Bar */}
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-lastfm-red/20 via-lastfm-red/10 to-transparent border-r-2 border-lastfm-red rounded-l-xl pointer-events-none transition-all duration-700"
                      style={{ width: `${percent}%` }}
                    />

                    <div className="relative z-10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 text-neutral-400 bg-black/40">
                          #{idx + 1}
                        </span>

                        <div className="min-w-0">
                          <a
                            href={track.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-sm text-white group-hover:text-lastfm-red transition-colors truncate block flex items-center gap-1.5"
                          >
                            <span className="truncate">{track.name}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </a>
                          <span className="text-xs text-neutral-400 truncate block">
                            {track.artist.name}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-sm text-white">
                          {plays.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-neutral-400 block font-medium">
                          {t.stats.scrobbles}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
