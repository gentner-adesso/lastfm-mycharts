import React, { useState } from 'react';
import { X, User, Save, RefreshCw, Sliders, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  getStoredUsername,
  setStoredUsername,
  getUserInfo,
} from '../services/lastfmApi';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const { t } = useLanguage();
  const [username, setUsername] = useState(getStoredUsername());
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [verifiedPlays, setVerifiedPlays] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    if (!cleanUser) return;

    setIsValidating(true);
    setValidationError(null);
    setVerifiedPlays(null);

    try {
      const userInfo = await getUserInfo(cleanUser);
      if (userInfo && userInfo.name) {
        setVerifiedPlays(Number(userInfo.playcount || 0).toLocaleString());
        setStoredUsername(userInfo.name);
        onSave();
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setValidationError(t.settings.userNotFound);
      }
    } catch {
      setValidationError(t.settings.userNotFound);
    } finally {
      setIsValidating(false);
    }
  };

  const handleReset = () => {
    const defaultUser = import.meta.env.VITE_LASTFM_USER || 'Sebastiangentner';
    setUsername(defaultUser);
    setValidationError(null);
    setVerifiedPlays(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
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
          {/* Username Input with Validation */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <User className="w-3.5 h-3.5 text-lastfm-red" />
              {t.settings.username}
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setValidationError(null);
                  setVerifiedPlays(null);
                }}
                className={`neu-inset w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 transition-all border ${
                  validationError
                    ? 'border-lastfm-red/70 focus:ring-lastfm-red'
                    : verifiedPlays
                    ? 'border-emerald-500/70 focus:ring-emerald-500'
                    : 'border-white/10 focus:ring-lastfm-red/50'
                }`}
                placeholder={t.settings.usernamePlaceholder}
                required
                disabled={isValidating}
              />
              {isValidating && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-lastfm-red animate-spin" />
                </div>
              )}
            </div>

            {/* Validation Feedback Messages */}
            {validationError && (
              <div className="mt-2 text-xs text-lastfm-red flex items-center gap-1.5 font-medium animate-in fade-in duration-150">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {verifiedPlays && (
              <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5 font-medium animate-in fade-in duration-150">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {t.settings.userVerified.replace('{plays}', verifiedPlays)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleReset}
              className="neu-button px-3.5 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Default</span>
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
                disabled={isValidating || !username.trim()}
                className="neu-button-red px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isValidating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{isValidating ? t.settings.validating : t.settings.save}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
