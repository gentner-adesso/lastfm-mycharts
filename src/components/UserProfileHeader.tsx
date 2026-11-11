import React from 'react';
import { LastFmUser } from '../types/lastfm';
import {
  Calendar,
  Flame,
  Clock,
  Music2,
  Mic2,
  Disc,
  Award,
  Sparkles,
} from 'lucide-react';

interface UserProfileHeaderProps {
  user: LastFmUser | null;
  loading: boolean;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ user, loading }) => {
  if (loading && !user) {
    return (
      <div className="neu-card p-8 animate-pulse flex flex-col md:flex-row gap-6 items-center">
        <div className="w-28 h-28 rounded-3xl bg-white/5 neu-inset"></div>
        <div className="space-y-3 flex-1 text-center md:text-left">
          <div className="h-8 bg-white/5 rounded-xl w-48"></div>
          <div className="h-4 bg-white/5 rounded-lg w-32"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="h-16 bg-white/5 rounded-xl"></div>
            <div className="h-16 bg-white/5 rounded-xl"></div>
            <div className="h-16 bg-white/5 rounded-xl"></div>
            <div className="h-16 bg-white/5 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const playcountNum = parseInt(user.playcount || '0', 10);
  const regTimestamp = parseInt(String(user.registered?.unixtime || '0'), 10) * 1000;
  const regDate = new Date(regTimestamp);
  const now = new Date();
  const totalDays = Math.max(1, Math.floor((now.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24)));
  const yearsActive = (totalDays / 365.25).toFixed(1);
  const scrobblesPerDay = (playcountNum / totalDays).toFixed(1);

  // Total listening time estimate: ~3.75 minutes average per track
  const totalHours = Math.round((playcountNum * 3.75) / 60);
  const totalDaysNonStop = Math.round(totalHours / 24);

  // Milestone Progress: towards 180,000 or next 10,000
  const nextMilestone = Math.ceil((playcountNum + 1) / 10000) * 10000;
  const prevMilestone = nextMilestone - 10000;
  const milestoneProgress = Math.min(
    100,
    Math.max(0, ((playcountNum - prevMilestone) / (nextMilestone - prevMilestone)) * 100)
  );
  const scrobblesUntilMilestone = nextMilestone - playcountNum;

  // Best avatar image
  const avatarUrl =
    user.image?.find((i) => i.size === 'extralarge' && i['#text'])?.['#text'] ||
    user.image?.[user.image.length - 1]?.['#text'] ||
    '';

  const formattedRegDate = regDate.toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="neu-card p-6 sm:p-8 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-lastfm-red/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center lg:items-start">
        {/* Avatar */}
        <div className="relative group shrink-0">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl neu-inset p-2 overflow-hidden border border-white/10">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-black rounded-2xl flex items-center justify-center text-white text-3xl font-black">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* User Info & Main Numbers */}
        <div className="flex-1 text-center lg:text-left">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 justify-center lg:justify-start">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {user.realname || user.name}
            </h1>
            <span className="text-neutral-400 text-lg font-mono">@{user.name}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-neu-muted font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-lastfm-red" />
              Dabei seit <strong className="text-white font-semibold">{formattedRegDate}</strong> ({yearsActive} Jahre)
            </span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Schnitt: <strong className="text-white font-semibold">{scrobblesPerDay}</strong> Scrobbles / Tag
            </span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-red-400" />
              ~<strong className="text-white font-semibold">{totalDaysNonStop.toLocaleString()}</strong> Tage reine Spielzeit ({totalHours.toLocaleString()} Std.)
            </span>
          </div>

          {/* Milestone Progress Bar */}
          <div className="mt-6 neu-inset p-4 rounded-2xl">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <Award className="w-4 h-4 text-lastfm-red" />
                Nächster Meilenstein:{' '}
                <span className="text-white font-bold">{nextMilestone.toLocaleString()} Scrobbles</span>
              </span>
              <span className="text-lastfm-red font-mono font-bold">
                Noch {scrobblesUntilMilestone.toLocaleString()} übrig ({milestoneProgress.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-neutral-600 via-lastfm-red to-[#ff2b1d] rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(213,16,7,0.7)]"
                style={{ width: `${milestoneProgress}%` }}
              />
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
            <div className="neu-card-sm p-3.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-neutral-400 text-xs font-medium mb-1">
                <Flame className="w-3.5 h-3.5 text-lastfm-red" />
                Scrobbles
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                {playcountNum.toLocaleString()}
              </div>
            </div>

            <div className="neu-card-sm p-3.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-neutral-400 text-xs font-medium mb-1">
                <Mic2 className="w-3.5 h-3.5 text-blue-400" />
                Künstler
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                {parseInt(user.artist_count || '0', 10).toLocaleString()}
              </div>
            </div>

            <div className="neu-card-sm p-3.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-neutral-400 text-xs font-medium mb-1">
                <Disc className="w-3.5 h-3.5 text-emerald-400" />
                Alben
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                {parseInt(user.album_count || '0', 10).toLocaleString()}
              </div>
            </div>

            <div className="neu-card-sm p-3.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-neutral-400 text-xs font-medium mb-1">
                <Music2 className="w-3.5 h-3.5 text-purple-400" />
                Tracks
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                {parseInt(user.track_count || '0', 10).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
