import React from 'react';
import { Search, Settings, ShieldCheck, User, LogIn } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  userProfile: UserProfile;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onOpenOwnerDashboard?: () => void;
  isOwner?: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userProfile,
  isOfflineMode,
  onToggleOfflineMode,
  onOpenSearch,
  onOpenProfile,
  onOpenAuth,
  onOpenOwnerDashboard,
  isOwner = false,
  activeTab,
  setActiveTab,
}) => {
  const isRegisteredUser = Boolean(userProfile.email && !userProfile.isAnonymous);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/95 via-black/80 to-transparent backdrop-blur-md px-4 py-3 transition-all duration-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3">
          <button
            id="brand-logo-btn"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 focus:outline-none group text-left"
          >
            <img
              src="/src/assets/images/pinoysinehub_official_logo_1787847319113.jpg"
              alt="Pinoysinehub Logo"
              className="w-9 h-9 rounded-lg object-cover shadow-lg border border-yellow-500/40 group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-[#E50914] drop-shadow-sm font-sans flex items-center">
              PINOY<span className="text-white">SINE</span><span className="text-yellow-400">HUB</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#E50914]/20 text-[#ff4b55] border border-[#E50914]/40">
              PH
            </span>
          </button>

          {/* Quick Nav Links on Tablet/Desktop */}
          <div className="hidden md:flex items-center gap-5 ml-4 text-xs font-medium text-neutral-300">
            <button
              onClick={() => setActiveTab('home')}
              className={`hover:text-white transition-colors ${activeTab === 'home' ? 'text-white font-bold' : ''}`}
            >
              Home / Lahat
            </button>
            <button
              onClick={() => setActiveTab('downloads')}
              className={`hover:text-white transition-colors ${activeTab === 'downloads' ? 'text-white font-bold' : ''}`}
            >
              Downloads & Offline
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Owner Dashboard Trigger (Only visible if owner or can be unlocked) */}
          {isOwner && onOpenOwnerDashboard && (
            <button
              id="owner-dashboard-btn"
              onClick={onOpenOwnerDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-md shadow-amber-950/50 transition-all active:scale-95"
              title="Tingnan ang dami ng nag-sign up at gumagamit (Owner Only)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Owner Analytics</span>
              <span className="sm:hidden">Stats</span>
            </button>
          )}

          {/* Search Button */}
          <button
            id="search-btn"
            onClick={onOpenSearch}
            className="p-2 rounded-full bg-neutral-800/80 text-neutral-200 hover:text-white hover:bg-neutral-700 transition-colors border border-neutral-700"
            aria-label="Search movies and series"
            title="Maghanap ng Tagalog Dubbed"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* User Sign In / Account Pill */}
          {isRegisteredUser ? (
            <button
              id="user-account-btn"
              onClick={onOpenProfile}
              className="flex items-center gap-2 py-1 px-2 rounded-full bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-white transition-colors text-xs font-semibold"
              title={userProfile.name}
            >
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-6 h-6 rounded-full object-cover border border-amber-500/50"
                referrerPolicy="no-referrer"
              />
              <span className="max-w-[80px] sm:max-w-[120px] truncate hidden xs:inline">
                {userProfile.name}
              </span>
            </button>
          ) : (
            <button
              id="signin-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-[#E50914] hover:bg-[#ff1f2a] text-white font-bold text-xs shadow transition-all active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Mag-Sign In</span>
            </button>
          )}

          {/* Settings Button */}
          <button
            id="settings-btn"
            onClick={onOpenProfile}
            className="flex items-center justify-center p-2 rounded-full border border-neutral-700 bg-neutral-800/80 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors"
            aria-label="Settings"
            title="Mga Setting ng App"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

