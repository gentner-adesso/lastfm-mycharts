import React, { useState } from 'react';
import { X, User, Save, RefreshCw, ShieldCheck, Sliders } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  getStoredUsername,
  setStoredUsername,
} from '../services/lastfmApi';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const { t } = useLanguage();
  const [username, setUsername] = useState(getStoredUsername());

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredUsername(username);
    onSave();
    onClose();
  };

  const handleReset = () => {
    localStorage.removeItem('lastfm_api_key');
    localStorage.removeItem('lastfm_username');
    setUsername(import.meta.env.VITE_LASTFM_USER || 'Sebastiangentner');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="neu-card w-full max-w-md p-6 sm:p-8 space-y-6 relative border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-lastfm-red/10 border border-lastfm-red/20 text-lastfm-red">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">{t.settings.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="neu-button p-2 rounded-xl text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-5">
          {/* Username Input */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <User className="w-3.5 h-3.5 text-lastfm-red" />
              {t.settings.username}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="neu-inset w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-lastfm-red/50 border border-white/10"
              placeholder="e.g. Sebastiangentner"
              required
            />
          </div>

          {/* Secure API Key Notice (No plain text, no input) */}
          <div className="neu-inset p-3.5 rounded-xl border border-white/5 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-white block">
                {t.settings.apiKeyStatus}
              </span>
              <p className="text-neutral-400 leading-relaxed">
                {t.settings.apiKeySecure}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleReset}
              className="neu-button px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t.settings.resetDefault}
            </button>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="neu-button px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white cursor-pointer"
              >
                {t.settings.cancel}
              </button>
              <button
                type="submit"
                className="neu-button-red px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {t.settings.save}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
