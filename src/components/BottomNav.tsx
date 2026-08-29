import React from 'react';
import { Home, Bookmark, Download, Settings } from 'lucide-react';
import { DownloadedItem, UserProfile } from '../types';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  downloads: DownloadedItem[];
  userProfile?: UserProfile;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  downloads,
  userProfile,
}) => {
  const completedDownloadsCount = downloads.filter((d) => d.status === 'completed').length;
  const isDownloadingAny = downloads.some((d) => d.status === 'downloading');
  const watchlistCount = userProfile?.watchlist?.length || 0;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-800/80 px-2 py-2 safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <button
          id="tab-home-btn"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium transition-colors ${
            activeTab === 'home' ? 'text-[#E50914] font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        {/* Watchlist */}
        <button
          id="tab-watchlist-btn"
          onClick={() => setActiveTab('watchlist')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium transition-colors ${
            activeTab === 'watchlist' ? 'text-[#E50914] font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <div className="relative">
            <Bookmark className="w-5 h-5 mb-0.5" />
            {watchlistCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center">
                {watchlistCount}
              </span>
            )}
          </div>
          <span>Listahan</span>
        </button>

        {/* Downloads */}
        <button
          id="tab-downloads-btn"
          onClick={() => setActiveTab('downloads')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium transition-colors ${
            activeTab === 'downloads' ? 'text-[#E50914] font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <div className="relative">
            <Download className={`w-5 h-5 mb-0.5 ${isDownloadingAny ? 'animate-bounce text-[#E50914]' : ''}`} />
            {completedDownloadsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#E50914] text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center">
                {completedDownloadsCount}
              </span>
            )}
          </div>
          <span>Downloads</span>
        </button>

        {/* Settings */}
        <button
          id="tab-profile-btn"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium transition-colors ${
            activeTab === 'profile' ? 'text-white font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span>Setting</span>
        </button>
      </div>
    </nav>
  );
};

