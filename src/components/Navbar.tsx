import React from 'react';
import { Disc3, RefreshCw, Settings, ExternalLink, Globe } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface NavbarProps {
  username: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  username,
  isRefreshing,
  onRefresh,
  onOpenSettings,
}) => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[#070709]/95 border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lastfm-red to-[#b30008] flex items-center justify-center shadow-neu-red-glow border border-white/20">
            <Disc3 className="w-6 h-6 text-white animate-spin [animation-duration:8s]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                LastFM <span className="text-lastfm-red">MyCharts</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-neutral-200 uppercase tracking-wider">
                {t.navbar.proStats}
              </span>
            </div>
            <p className="text-xs text-neutral-300 flex items-center gap-1.5 font-medium">
              {t.navbar.profile}:
              <a
                href={`https://www.last.fm/user/${username}`}
                target="_blank"
                rel="noreferrer"
                className="text-white hover:text-lastfm-red font-semibold transition-colors inline-flex items-center gap-0.5 underline decoration-white/30 underline-offset-2"
              >
                @{username}
                <ExternalLink className="w-3 h-3 inline ml-0.5 opacity-80" />
              </a>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Language Switcher Pill Button */}
          <button
            onClick={toggleLanguage}
            className="neu-button px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 text-white hover:text-lastfm-red transition-all cursor-pointer border border-white/15"
            title={language === 'en' ? 'Auf Deutsch umschalten' : 'Switch to English'}
          >
            <Globe className="w-3.5 h-3.5 text-lastfm-red" />
            <span className="font-mono">{language === 'en' ? 'EN' : 'DE'}</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="neu-button px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 text-white hover:text-lastfm-red transition-all disabled:opacity-50 cursor-pointer"
            title={t.navbar.refresh}
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-lastfm-red' : ''}`}
            />
            <span className="hidden sm:inline">
              {isRefreshing ? t.navbar.refreshing : t.navbar.refresh}
            </span>
          </button>

          <button
            onClick={onOpenSettings}
            className="neu-button p-2.5 rounded-xl text-white hover:text-lastfm-red transition-all cursor-pointer"
            title={t.navbar.settings}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
