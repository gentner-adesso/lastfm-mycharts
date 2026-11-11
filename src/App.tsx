import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { UserProfileHeader } from './components/UserProfileHeader';
import { NowPlayingBanner } from './components/NowPlayingBanner';
import { CollageSection } from './components/CollageSection';
import { StatsDashboard } from './components/StatsDashboard';
import { RecentTracksFeed } from './components/RecentTracksFeed';
import { SettingsModal } from './components/SettingsModal';
import { getUserInfo, getRecentTracks, getStoredUsername } from './services/lastfmApi';
import { LastFmRecentTrack, LastFmUser } from './types/lastfm';
import { Layers, BarChart3, History } from 'lucide-react';

export const App: React.FC = () => {
  const [username, setUsername] = useState<string>(getStoredUsername());
  const [user, setUser] = useState<LastFmUser | null>(null);
  const [recentTracks, setRecentTracks] = useState<LastFmRecentTrack[]>([]);
  const [nowPlaying, setNowPlaying] = useState<LastFmRecentTrack | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'collage' | 'stats' | 'history'>('collage');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const currentUsername = getStoredUsername();
      setUsername(currentUsername);

      const [userData, recentData] = await Promise.all([
        getUserInfo(currentUsername),
        getRecentTracks(currentUsername, 25),
      ]);

      setUser(userData);
      setRecentTracks(recentData.tracks);
      setNowPlaying(recentData.nowPlaying);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Fehler beim Laden der Last.fm Daten');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Auto-refresh now playing every 30 seconds
    const interval = setInterval(() => {
      loadData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  const handleSettingsSaved = () => {
    loadData();
  };

  return (
    <div className="min-h-screen bg-neu-bg text-neu-text flex flex-col font-sans selection:bg-lastfm-red selection:text-white">
      {/* Navbar */}
      <Navbar
        username={username}
        isRefreshing={isRefreshing}
        onRefresh={() => loadData(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {error && (
          <div className="neu-card p-4 bg-red-950/40 border border-lastfm-red/40 text-red-200 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => loadData()}
              className="px-3 py-1 bg-lastfm-red text-white text-xs font-bold rounded-lg hover:bg-lastfm-hover"
            >
              Erneut versuchen
            </button>
          </div>
        )}

        {/* User Hero Profile */}
        <UserProfileHeader user={user} loading={loading} />

        {/* Now Playing or Last Played Banner */}
        <NowPlayingBanner
          nowPlaying={nowPlaying}
          lastScrobbled={recentTracks.length > 0 ? recentTracks[0] : null}
        />

        {/* Navigation Tabs */}
        <div className="flex justify-center sm:justify-start">
          <div className="neu-card p-1.5 flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('collage')}
              className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'collage'
                  ? 'neu-button-active text-lastfm-red border border-lastfm-red/30'
                  : 'neu-button text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Top-Alben Collagen</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'stats'
                  ? 'neu-button-active text-lastfm-red border border-lastfm-red/30'
                  : 'neu-button text-neutral-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Hörgewohnheiten & Ranglisten</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'history'
                  ? 'neu-button-active text-lastfm-red border border-lastfm-red/30'
                  : 'neu-button text-neutral-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Scrobble-Historie</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {activeTab === 'collage' && <CollageSection />}
          {activeTab === 'stats' && <StatsDashboard user={user} />}
          {activeTab === 'history' && (
            <RecentTracksFeed tracks={recentTracks} loading={loading} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 text-center text-xs text-neu-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <span>LastFM MyCharts für</span>
            <span className="text-white font-bold">@{username}</span>
            <span>— Entworfen im Neumorphismus-Stil</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span>Powered by</span>
            <a
              href="https://www.last.fm"
              target="_blank"
              rel="noreferrer"
              className="text-lastfm-red font-bold hover:underline"
            >
              Last.fm
            </a>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsSaved}
      />
    </div>
  );
};

export default App;
