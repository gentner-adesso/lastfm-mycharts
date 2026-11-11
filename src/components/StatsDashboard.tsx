import React, { useEffect, useState } from 'react';
import { LastFmArtist, LastFmTrack, LastFmUser, TimePeriod } from '../types/lastfm';
import { getTopArtists, getTopTracks } from '../services/lastfmApi';
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

const STATS_PERIODS: { label: string; value: TimePeriod }[] = [
  { label: '7 Tage', value: '7day' },
  { label: '1 Monat', value: '1month' },
  { label: '3 Monate', value: '3month' },
  { label: '6 Monate', value: '6month' },
  { label: '12 Monate', value: '12month' },
  { label: 'Gesamt (All Time)', value: 'overall' },
];

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ user }) => {
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
          setError(err.message || 'Fehler beim Laden der Statistiken');
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
              Hörgewohnheiten & <span className="text-lastfm-red">Ranglisten</span>
            </h2>
          </div>
          <p className="text-sm text-neu-muted mt-1">
            Umfassende Auswertungen deiner meistgehörten Künstler und Tracks.
          </p>
        </div>

        {/* Time Period Tabs */}
        <div className="neu-card p-1.5 flex flex-wrap gap-1 self-start md:self-auto">
          {STATS_PERIODS.map((t) => {
            const active = period === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setPeriod(t.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? 'neu-button-active text-lastfm-red border border-lastfm-red/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cool Analytic Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="neu-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Top-Künstler Dominanz
            </span>
            <Percent className="w-4 h-4 text-lastfm-red" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{top10Dominance}%</div>
          <p className="text-xs text-neutral-400 mt-1">
            deiner All-Time Scrobbles stammen allein aus deinen Top 10 Interpreten.
          </p>
        </div>

        <div className="neu-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Dauerbrenner #1
            </span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-white font-mono truncate">
            {topArtists[0]?.name || '—'}
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Mit <strong className="text-lastfm-red font-mono">{Number(topArtists[0]?.playcount || 0).toLocaleString()}</strong> Scrobbles dein unangefochtener Spitzenreiter!
          </p>
        </div>

        <div className="neu-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Häufigster Track
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono truncate">
            {topTracks[0]?.name || '—'}
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Von {topTracks[0]?.artist.name} (<span className="text-emerald-400 font-mono font-bold">{topTracks[0]?.playcount}</span> Durchläufe).
          </p>
        </div>
      </div>

      {loading ? (
        <div className="neu-card p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-lastfm-red animate-spin" />
          <span className="text-xs text-neutral-400">Lade Statistiken...</span>
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
                  Top Künstler
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
                    className="neu-card-sm p-3.5 relative overflow-hidden group hover:border-white/10 transition-colors"
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
                              : 'text-neutral-500 bg-black/20'
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
                          Scrobbles
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
                  Top Tracks
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
                    className="neu-card-sm p-3.5 relative overflow-hidden group hover:border-white/10 transition-colors"
                  >
                    {/* Background Progress Bar */}
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-lastfm-red/20 via-lastfm-red/10 to-transparent border-r-2 border-lastfm-red rounded-l-xl pointer-events-none transition-all duration-700"
                      style={{ width: `${percent}%` }}
                    />

                    <div className="relative z-10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 text-neutral-500 bg-black/20">
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
                          Scrobbles
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
