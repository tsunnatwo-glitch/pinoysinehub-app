import React, { useState } from 'react';
import {
  X,
  Sliders,
  Trash2,
  Check,
  User,
  Mail,
  LogIn,
  LogOut,
  ShieldCheck,
  Smartphone,
  Wifi,
} from 'lucide-react';
import { QualityTier, UserProfile } from '../types';
import { OWNER_EMAIL } from '../services/userService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenOwnerDashboard: () => void;
  onClearDownloads: () => void;
  isOwner?: boolean;
}

export const ProfileModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onOpenAuth,
  onLogout,
  onOpenOwnerDashboard,
  onClearDownloads,
  isOwner = false,
}) => {
  const [downloadWifiOnly, setDownloadWifiOnly] = useState(true);
  const [smartDownloads, setSmartDownloads] = useState(true);
  const [defaultQuality, setDefaultQuality] = useState<QualityTier>('HD (720p)');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const isRegistered = Boolean(userProfile.email && !userProfile.isAnonymous);
  const effectiveIsOwner = isOwner || userProfile.role === 'owner' || userProfile.email?.toLowerCase().trim() === OWNER_EMAIL.toLowerCase();

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl text-white relative animate-in fade-in zoom-in-95 duration-200 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#E50914]" />
            <span>Account at Mga Setting</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Account Card */}
        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-neutral-700"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>{userProfile.name}</span>
                  {isOwner && (
                    <span className="text-[9px] bg-amber-500 text-black font-black px-1.5 py-0.2 rounded">
                      OWNER
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-400 font-mono">
                  {userProfile.email ? userProfile.email : 'Bisita / Guest Viewer'}
                </div>
              </div>
            </div>

            {isRegistered ? (
              <button
                id="signout-action-btn"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-300 hover:text-white border border-red-800/80 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                title="Mag-Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="py-1.5 px-3 rounded-lg bg-[#E50914] hover:bg-[#ff1f2a] text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Mag-Sign In</span>
              </button>
            )}
          </div>

          {/* Owner Dashboard Shortcut - ONLY visible if owner */}
          {effectiveIsOwner && (
            <button
              onClick={() => {
                onClose();
                onOpenOwnerDashboard();
              }}
              className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-amber-500/20 to-neutral-900 border border-amber-500/40 text-amber-300 hover:text-white hover:border-amber-400 text-xs font-bold flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Owner Analytics (Stats & User Registry)</span>
              </span>
              <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-black">
                BUKSAN
              </span>
            </button>
          )}
        </div>

        {/* Streaming & Download Settings */}
        <div className="space-y-3 text-xs">
          <h3 className="font-bold text-neutral-400 uppercase tracking-wider">
            Download at Offline Setting
          </h3>

          {/* Wi-Fi Only */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-850 border border-neutral-800">
            <div>
              <span className="font-semibold block text-neutral-200">I-download sa Wi-Fi Lamang</span>
              <span className="text-[11px] text-neutral-400">Proteksyon laban sa mobile data charges</span>
            </div>
            <button
              onClick={() => setDownloadWifiOnly(!downloadWifiOnly)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                downloadWifiOnly ? 'bg-[#E50914]' : 'bg-neutral-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  downloadWifiOnly ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Smart Downloads */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-850 border border-neutral-800">
            <div>
              <span className="font-semibold block text-neutral-200">Smart Downloads</span>
              <span className="text-[11px] text-neutral-400">Kusang ida-download ang susunod na episode</span>
            </div>
            <button
              onClick={() => setSmartDownloads(!smartDownloads)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                smartDownloads ? 'bg-[#E50914]' : 'bg-neutral-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  smartDownloads ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Default Download Quality */}
          <div className="p-3 rounded-xl bg-neutral-850 border border-neutral-800">
            <span className="font-semibold block text-neutral-200 mb-2">Default Video Quality</span>
            <div className="grid grid-cols-3 gap-2">
              {(['SD (480p)', 'HD (720p)', 'FHD (1080p)'] as QualityTier[]).map((q) => (
                <button
                  key={q}
                  onClick={() => setDefaultQuality(q)}
                  className={`p-2 rounded-lg font-bold text-center transition-colors ${
                    defaultQuality === q
                      ? 'bg-[#E50914] text-white'
                      : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  {q.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clear downloads button */}
        <button
          onClick={onClearDownloads}
          className="w-full py-2.5 rounded-xl bg-neutral-850 hover:bg-red-950/60 text-red-400 hover:text-red-300 font-bold text-xs flex items-center justify-center gap-2 border border-neutral-800 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Linisin ang Lahat ng Offline Downloads</span>
        </button>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl bg-white text-black font-extrabold text-xs sm:text-sm hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : null}
          <span>{savedSuccess ? 'Na-save na ang Setting!' : 'I-save ang Setting'}</span>
        </button>
      </div>
    </div>
  );
};
