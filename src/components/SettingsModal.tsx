import React, { useState } from 'react';
import { X, Key, User, Save, RefreshCw } from 'lucide-react';
import {
  getStoredApiKey,
  getStoredUsername,
  setStoredApiKey,
  setStoredUsername,
} from '../services/lastfmApi';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [username, setUsername] = useState(getStoredUsername());
  const [apiKey, setApiKey] = useState(getStoredApiKey());

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredUsername(username);
    setStoredApiKey(apiKey);
    onSave();
    onClose();
  };

  const handleReset = () => {
    localStorage.removeItem('lastfm_api_key');
    localStorage.removeItem('lastfm_username');
    setUsername(import.meta.env.VITE_LASTFM_USER || 'Sebastiangentner');
    setApiKey(import.meta.env.VITE_LASTFM_API_KEY || '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="neu-card w-full max-w-lg p-6 sm:p-8 space-y-6 relative border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-lastfm-red/10 border border-lastfm-red/20 text-lastfm-red">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">API & Profil Einstellungen</h3>
          </div>
          <button
            onClick={onClose}
            className="neu-button p-2 rounded-xl text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <User className="w-3.5 h-3.5 text-lastfm-red" />
              Last.fm Nutzername
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="neu-inset w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-lastfm-red/50"
              placeholder="z.B. Sebastiangentner"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Key className="w-3.5 h-3.5 text-lastfm-red" />
              Last.fm API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="neu-inset w-full px-4 py-3 rounded-xl text-white text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-lastfm-red/50"
              placeholder="API Key"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
            <button
              type="button"
              onClick={handleReset}
              className="neu-button px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Auf Standard zurücksetzen
            </button>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="neu-button px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="neu-button-red px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                Speichern
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
