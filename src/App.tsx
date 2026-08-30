/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Movie, Episode, DownloadedItem, UserProfile, QualityTier } from './types';
import { MOVIES_CATALOG, GENRE_CATEGORIES } from './data/catalog';
import { storageService } from './services/storageService';
import { movieService } from './services/movieService';
import { userService, OWNER_EMAIL } from './services/userService';

import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { MovieRow } from './components/MovieRow';
import { MovieDetailModal } from './components/MovieDetailModal';
import { VideoPlayer } from './components/VideoPlayer';
import { DownloadsView } from './components/DownloadsView';
import { WatchlistView } from './components/WatchlistView';
import { SearchModal } from './components/SearchModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { OwnerDashboardModal } from './components/OwnerDashboardModal';
import { OfflineBanner } from './components/OfflineBanner';

export default function App() {
  // App navigation state
  const [activeTab, setActiveTab] = useState<string>('home'); // 'home' | 'watchlist' | 'downloads' | 'profile'
  const [selectedGenreCategory, setSelectedGenreCategory] = useState<string>('All');

  // Persistence state
  const [customMovies, setCustomMovies] = useState<Movie[]>([]);
  const [deletedMovieIds, setDeletedMovieIds] = useState<string[]>(() => storageService.getDeletedMovieIds());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => storageService.getUserProfile());
  const [downloads, setDownloads] = useState<DownloadedItem[]>(() => storageService.getDownloads());
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => storageService.getOfflineMode());

  // Load custom movies from Firestore
  useEffect(() => {
    let cancelled = false;

    const loadCustomMovies = async () => {
      try {
        const movies = await movieService.getCustomMovies();

        if (!cancelled) {
          setCustomMovies(movies);
        }
      } catch (error) {
        console.error('Failed to load custom movies from Firestore:', error);

        // Fallback to localStorage if Firestore is unavailable
        if (!cancelled) {
          setCustomMovies(storageService.getCustomMovies());
        }
      }
    };

    loadCustomMovies();

    return () => {
      cancelled = true;
    };
  }, []);
  // Modals state
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState<Movie | null>(null);
  const [activePlayingMovie, setActivePlayingMovie] = useState<Movie | null>(null);
  const [activePlayingEpisode, setActivePlayingEpisode] = useState<Episode | undefined>(undefined);
  const [isPlayingDownloadedItem, setIsPlayingDownloadedItem] = useState<boolean>(false);

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isOwnerDashboardOpen, setIsOwnerDashboardOpen] = useState<boolean>(false);

  // Combined Catalog
  const fullCatalog: Movie[] = [...customMovies, ...MOVIES_CATALOG].filter(
    (m) => !deletedMovieIds.includes(m.id)
  );

  // Download notification toast
  const [downloadToast, setDownloadToast] = useState<{ title: string; progress: number } | null>(null);

  // Auth sync with Firebase
  useEffect(() => {
    const unsubscribe = userService.subscribeAuth((cloudUser) => {
      if (cloudUser) {
        setUserProfile(cloudUser);
        storageService.saveUserProfile(cloudUser);
      } else {
        // If logged out from Firebase
        const currentLocal = storageService.getUserProfile();
        if (currentLocal.email) {
          // If we had an email before, reset to fresh guest
          const guest = userService.createFreshGuest();
          setUserProfile(guest);
          storageService.saveUserProfile(guest);
        }
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Save changes locally and sync to Cloud
  useEffect(() => {
    storageService.saveUserProfile(userProfile);
    userService.syncUserProfileToCloud(userProfile).catch(() => {});
  }, [userProfile]);

  useEffect(() => {
    storageService.saveCustomMovies(customMovies);
  }, [customMovies]);

  useEffect(() => {
    storageService.saveDeletedMovieIds(deletedMovieIds);
  }, [deletedMovieIds]);

  useEffect(() => {
    storageService.saveDownloads(downloads);
  }, [downloads]);

  useEffect(() => {
    storageService.setOfflineMode(isOfflineMode);
  }, [isOfflineMode]);

  // Is Owner check
  const isOwner = userService.isOwner(userProfile);

  // Helper arrays for rows based on 4 exact Tagalog categories
  const downloadedMovieIds = downloads.map((d) => d.movieId);
  const tagalogDubbedMovies = fullCatalog.filter(
    (m) => m.category === 'Tagalog Dubbed Movies' || (m.type === 'movie' && !m.genres?.includes('Anime'))
  );
  const tagalogDubbedSeries = fullCatalog.filter(
    (m) => m.category === 'Tagalog Dubbed Tv Series' || (m.type === 'series' && !m.genres?.includes('Anime'))
  );
  const tagalogDubbedAnimeMovies = fullCatalog.filter(
    (m) => m.category === 'Tagalog Dubbed Anime Movies' || (m.genres?.includes('Anime') && m.type === 'movie')
  );
  const tagalogDubbedAnimeSeries = fullCatalog.filter(
    (m) => m.category === 'Tagalog Dubbed Anime Tv Series' || (m.genres?.includes('Anime') && m.type === 'series')
  );

  const top10Movies = fullCatalog.filter((m) => m.isTop10).sort((a, b) => (a.rank || 99) - (b.rank || 99));

  // Continue Watching list from profile history
  const continueWatchingMovies = userProfile.history
    .map((h) => fullCatalog.find((m) => m.id === h.movieId))
    .filter(Boolean) as Movie[];

  // Filtered catalog when user clicks category pill
  const filteredCatalog =
    selectedGenreCategory === 'All'
      ? []
      : fullCatalog.filter(
          (m) =>
            m.category === selectedGenreCategory ||
            (selectedGenreCategory === 'Tagalog Dubbed Movies' && m.type === 'movie' && !m.genres?.includes('Anime')) ||
            (selectedGenreCategory === 'Tagalog Dubbed Tv Series' && m.type === 'series' && !m.genres?.includes('Anime')) ||
            (selectedGenreCategory === 'Tagalog Dubbed Anime Movies' && m.genres?.includes('Anime') && m.type === 'movie') ||
            (selectedGenreCategory === 'Tagalog Dubbed Anime Tv Series' && m.genres?.includes('Anime') && m.type === 'series')
        );

  // Actions
  const handlePlayMovie = (movie: Movie, episode?: Episode) => {
    setActivePlayingMovie(movie);
    setActivePlayingEpisode(episode);
    setIsPlayingDownloadedItem(false);

    // Update history
    const existingIndex = userProfile.history.findIndex((h) => h.movieId === movie.id);
    let updatedHistory = [...userProfile.history];
    if (existingIndex >= 0) {
      updatedHistory[existingIndex] = {
        ...updatedHistory[existingIndex],
        watchedAt: Date.now(),
      };
    } else {
      updatedHistory.unshift({
        movieId: movie.id,
        watchedAt: Date.now(),
        progressPercentage: 15,
        lastPositionSec: 300,
      });
    }
    setUserProfile({ ...userProfile, history: updatedHistory });
  };

  const handlePlayDownloadedItem = (item: DownloadedItem) => {
    const movie = fullCatalog.find((m) => m.id === item.movieId) || {
      id: item.movieId,
      title: item.title,
      tagline: '',
      description: '',
      poster: item.poster,
      backdrop: item.backdrop,
      duration: item.duration,
      year: 2026,
      rating: '8.8',
      matchScore: 95,
      genres: ['Offline Video'],
      tags: ['Offline'],
      type: item.type,
      videoUrl: item.videoUrl,
      cast: [],
      director: '',
      maturityRating: 'PG-13',
      qualityAvailable: [item.quality],
      audioTracks: ['Default Audio'],
      subtitles: ['Filipino', 'English'],
      fileSizeMB: item.fileSizeMB,
    };

    setActivePlayingMovie(movie as Movie);
    setActivePlayingEpisode(undefined);
    setIsPlayingDownloadedItem(true);
  };

  const handleStartDownload = (movie: Movie, episode?: Episode, quality: QualityTier = 'HD (720p)') => {
    const downloadId = `dl-${movie.id}-${episode ? episode.id : 'full'}`;
    if (downloads.some((d) => d.id === downloadId)) {
      alert(`Na-download na ang "${episode ? episode.title : movie.title}" sa offline storage.`);
      return;
    }

    const calculatedSize = quality.includes('4K') ? 950 : quality.includes('1080p') ? 580 : 320;
    const newItem: DownloadedItem = {
      id: downloadId,
      movieId: movie.id,
      episodeId: episode?.id,
      title: episode ? `${movie.title}: ${episode.title}` : movie.title,
      subTitle: episode ? episode.duration : `${movie.duration} • ${movie.audioTracks[0] || 'Original Audio'}`,
      poster: movie.poster,
      backdrop: episode?.thumbnail || movie.backdrop,
      duration: episode ? episode.duration : movie.duration,
      quality,
      fileSizeMB: calculatedSize,
      downloadedAt: Date.now(),
      progress: 0,
      status: 'downloading',
      videoUrl: episode ? episode.videoUrl : movie.videoUrl,
      type: movie.type,
    };

    setDownloads((prev) => [newItem, ...prev]);
    setDownloadToast({ title: newItem.title, progress: 15 });

    let currentProgress = 15;
    const interval = setInterval(() => {
      currentProgress += 25;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setDownloads((prev) =>
          prev.map((d) => (d.id === downloadId ? { ...d, progress: 100, status: 'completed' } : d))
        );
        setDownloadToast({ title: newItem.title, progress: 100 });
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
        setTimeout(() => setDownloadToast(null), 3000);
      } else {
        setDownloads((prev) =>
          prev.map((d) => (d.id === downloadId ? { ...d, progress: currentProgress } : d))
        );
        setDownloadToast({ title: newItem.title, progress: currentProgress });
      }
    }, 600);
  };

  const handleAddCustomMovie = async (newMovie: Movie) => {
    try {
      await movieService.saveMovie(newMovie);
      setCustomMovies((prev) => [newMovie, ...prev]);
      setDeletedMovieIds((prev) => prev.filter((id) => id !== newMovie.id));
    } catch (error) {
      console.error('Failed to save movie to Firestore:', error);
      alert('Hindi na-save ang movie sa cloud. Pakisubukan ulit.');
    }
  };

  const handleUpdateCustomMovie = async (updatedMovie: Movie) => {
    try {
      await movieService.saveMovie(updatedMovie);
      setCustomMovies((prev) => prev.map((movie) => movie.id === updatedMovie.id ? updatedMovie : movie));
      setDeletedMovieIds((prev) => prev.filter((id) => id !== updatedMovie.id));
      setSelectedMovieForDetails((current) => current?.id === updatedMovie.id ? updatedMovie : current);
      setActivePlayingMovie((current) => current?.id === updatedMovie.id ? updatedMovie : current);
      setActivePlayingEpisode((current) => {
        if (!current || !updatedMovie.episodes) return current;
        return updatedMovie.episodes.find((episode) => episode.id === current.id) || current;
      });
    } catch (error) {
      console.error('Failed to update movie in Firestore:', error);
      alert('Hindi na-update ang movie sa cloud. Pakisubukan ulit.');
    }
  };

  const handleDeleteMovie = async (movieId: string) => {
    const isCustomMovie = customMovies.some((m) => m.id === movieId);

    if (isCustomMovie) {
      try {
        await movieService.deleteMovie(movieId);
        setCustomMovies((prev) => prev.filter((m) => m.id !== movieId));
      } catch (error) {
        console.error('Failed to delete movie from Firestore:', error);
        alert('Hindi na-delete ang movie sa cloud. Pakisubukan ulit.');
        return;
      }
    } else {
      setDeletedMovieIds((prev) => (prev.includes(movieId) ? prev : [...prev, movieId]));
    }

    setSelectedMovieForDetails((current) => (current?.id === movieId ? null : current));
    setActivePlayingMovie((current) => (current?.id === movieId ? null : current));
  };

  const handleDeleteDownload = (id: string) => {
    setDownloads((prev) => prev.filter((d) => d.id !== id));
  };

  const handleClearAllDownloads = () => {
    if (confirm('Sigurado ka bang nais mong burahin ang lahat ng na-download na palabas para makapag-free up ng space?')) {
      setDownloads([]);
    }
  };

  const handleToggleWatchlist = (movieId: string) => {
    const list = userProfile.watchlist;
    const updated = list.includes(movieId) ? list.filter((id) => id !== movieId) : [...list, movieId];
    setUserProfile({ ...userProfile, watchlist: updated });
  };

  const handleRateMovie = (movieId: string, rating: 'like' | 'love' | 'dislike') => {
    let liked = [...userProfile.likedIds];
    let loved = [...userProfile.lovedIds];

    if (rating === 'like') {
      liked = liked.includes(movieId) ? liked.filter((id) => id !== movieId) : [...liked, movieId];
      loved = loved.filter((id) => id !== movieId);
    } else if (rating === 'love') {
      loved = loved.includes(movieId) ? loved.filter((id) => id !== movieId) : [...loved, movieId];
      liked = liked.filter((id) => id !== movieId);
    }
    setUserProfile({ ...userProfile, likedIds: liked, lovedIds: loved });
  };

  const handleLogout = () => {
    const guestProfile = userService.createFreshGuest();
    setUserProfile(guestProfile);
    storageService.saveUserProfile(guestProfile);
    setIsProfileOpen(false);
    userService.signOutUser().catch(() => {});
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-[#E50914] selection:text-white flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar
        userProfile={userProfile}
        isOfflineMode={isOfflineMode}
        onToggleOfflineMode={() => setIsOfflineMode(!isOfflineMode)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOwnerDashboard={() => setIsOwnerDashboardOpen(true)}
        isOwner={isOwner}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Offline Mode Banner */}
      <div className="pt-14">
        <OfflineBanner
          isOfflineMode={isOfflineMode}
          onToggleOnline={() => setIsOfflineMode(false)}
          onGoToDownloads={() => setActiveTab('downloads')}
        />
      </div>

      {/* Live Download Progress Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-18 md:bottom-6 right-4 z-50 bg-neutral-900 border border-neutral-700 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm animate-in slide-in-from-bottom duration-300">
          <div className="relative w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-[#E50914]">{downloadToast.progress}%</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white truncate">
              {downloadToast.progress === 100 ? 'Download Complete!' : 'Dina-download...'}
            </h4>
            <p className="text-[11px] text-neutral-400 truncate">{downloadToast.title}</p>
          </div>
        </div>
      )}

      {/* MAIN VIEW CONTENT */}
      <main className="flex-1 pb-16 md:pb-12 pt-16 sm:pt-20">
        {/* TAB: HOME / BROWSE */}
        {activeTab === 'home' && (
          <div>
            {/* Quick Category Selector Pills */}
            <div className="max-w-6xl mx-auto px-4 mb-4 overflow-x-auto no-scrollbar flex items-center gap-2">
              {GENRE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedGenreCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${
                    selectedGenreCategory === cat
                      ? 'bg-[#E50914] text-white font-bold shadow-md shadow-red-950'
                      : 'bg-neutral-900/90 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Selected Category Filter Results (if filtered) */}
            {selectedGenreCategory !== 'All' && (
              <div className="max-w-6xl mx-auto px-4 my-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    Mga Palabas sa kategoryang: {selectedGenreCategory}
                  </h2>
                  <button
                    onClick={() => setSelectedGenreCategory('All')}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    I-reset (Show All)
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredCatalog.map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => setSelectedMovieForDetails(movie)}
                      className="cursor-pointer group relative aspect-[2/3] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-all hover:scale-103"
                    >
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 p-2 flex flex-col justify-end">
                        <p className="text-xs font-bold text-white truncate">{movie.title}</p>
                        <span className="text-[10px] text-emerald-400">{movie.matchScore}% Match</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom User-Added Movies Row (if any) */}
            {customMovies.length > 0 && selectedGenreCategory === 'All' && (
              <MovieRow
                title="⭐ Aking Mga Idinagdag na Video & Pelikula"
                subtitle="Mga custom video link at poster na iyong in-upload"
                movies={customMovies}
                onSelectMovie={(m) => setSelectedMovieForDetails(m)}
                onPlayMovie={handlePlayMovie}
                onStartDownload={handleStartDownload}
                downloadedMovieIds={downloadedMovieIds}
                watchlist={userProfile.watchlist}
                onToggleWatchlist={handleToggleWatchlist}
              />
            )}

            {/* Continue Watching Row */}
            {continueWatchingMovies.length > 0 && selectedGenreCategory === 'All' && (
              <MovieRow
                title="Patuloy na Panoorin (Continue Watching)"
                subtitle="Ituloy kung saan ka huminto"
                movies={continueWatchingMovies}
                onSelectMovie={(m) => setSelectedMovieForDetails(m)}
                onPlayMovie={handlePlayMovie}
                onStartDownload={handleStartDownload}
                downloadedMovieIds={downloadedMovieIds}
                watchlist={userProfile.watchlist}
                onToggleWatchlist={handleToggleWatchlist}
              />
            )}

            {/* Top 10 Today in Philippines Row */}
            {selectedGenreCategory === 'All' && (
              <MovieRow
                title="Top 10 Pelikula sa Pilipinas Ngayon 🇵🇭"
                subtitle="Ang pinaka-patok na pinapanood sa bansa"
                movies={top10Movies}
                isTop10={true}
                onSelectMovie={(m) => setSelectedMovieForDetails(m)}
                onPlayMovie={handlePlayMovie}
                onStartDownload={handleStartDownload}
                downloadedMovieIds={downloadedMovieIds}
                watchlist={userProfile.watchlist}
                onToggleWatchlist={handleToggleWatchlist}
              />
            )}

            {/* 1. Tagalog Dubbed Movies Row */}
            {selectedGenreCategory === 'All' && tagalogDubbedMovies.length > 0 && (
              <MovieRow
                title="🎬 TAGALOG DUBBED MOVIES"
                subtitle="Blockbuster at international movies na may Tagalog boses"
                movies={tagalogDubbedMovies}
                onSelectMovie={(m) => setSelectedMovieForDetails(m)}
                onPlayMovie={handlePlayMovie}
                onStartDownload={handleStartDownload}
                downloadedMovieIds={downloadedMovieIds}
                watchlist={userProfile.watchlist}
                onToggleWatchlist={handleToggleWatchlist}
              />
            )}

            {/* 2. Tagalog Dubbed Tv Series Row */}
            {selectedGenreCategory === 'All' && tagalogDubbedSeries.length > 0 && (
              <MovieRow
                title="📺 TAGALOG DUBBED TV SERIES"
                subtitle="Kumpletong episodes ng mga teleserye at foreign drama sa Tagalog"
                movies={tagalogDubbedSeries}
                onSelectMovie={(m) => setSelectedMovieForDetails(m)}
                onPlayMovie={handlePlayMovie}
                onStartDownload={handleStartDownload}
                downloadedMovieIds={downloadedMovieIds}
                watchlist={userProfile.watchlist}
                onToggleWatchlist={handleToggleWatchlist}
              />
            )}

            {/* 3. Tagalog Dubbed Anime Movies Row */}
            {selectedGenreCategory === 'All' && tagalogDubbedAnimeMovies.length > 0 && (
              <MovieRow
                title="🍙 TAGALOG DUBBED ANIME MOVIES"
                subtitle="Epic Japanese animation movies na naka-Tagalog Dubbed"
                movies={tagalogDubbedAnimeMovies}
                onSelectMovie={(m) => setSelectedMovieForDetails(m)}
                onPlayMovie={handlePlayMovie}
                onStartDownload={handleStartDownload}
                downloadedMovieIds={downloadedMovieIds}
                watchlist={userProfile.watchlist}
                onToggleWatchlist={handleToggleWatchlist}
              />
            )}

            {/* 4. Tagalog Dubbed Anime Tv Series Row */}
            {selectedGenreCategory === 'All' && tagalogDubbedAnimeSeries.length > 0 && (
              <MovieRow
                title="⚡ TAGALOG DUBBED ANIME TV SERIES"
                subtitle="Shonen, mecha, at supernatural anime series na naka-Tagalog boses"
                movies={tagalogDubbedAnimeSeries}
                onSelectMovie={(m) => setSelectedMovieForDetails(m)}
                onPlayMovie={handlePlayMovie}
                onStartDownload={handleStartDownload}
                downloadedMovieIds={downloadedMovieIds}
                watchlist={userProfile.watchlist}
                onToggleWatchlist={handleToggleWatchlist}
              />
            )}
          </div>
        )}

        {/* TAB: WATCHLIST */}
        {activeTab === 'watchlist' && (
          <WatchlistView
            watchlistMovieIds={userProfile.watchlist}
            allMovies={fullCatalog}
            onSelectMovie={(m) => setSelectedMovieForDetails(m)}
            onPlayMovie={handlePlayMovie}
            onRemoveFromWatchlist={handleToggleWatchlist}
            onBrowseMore={() => setActiveTab('home')}
          />
        )}

        {/* TAB: DOWNLOADS & OFFLINE STORAGE */}
        {activeTab === 'downloads' && (
          <DownloadsView
            downloads={downloads}
            onPlayDownloadedItem={handlePlayDownloadedItem}
            onDeleteDownload={handleDeleteDownload}
            onClearAllDownloads={handleClearAllDownloads}
            isOfflineMode={isOfflineMode}
            onToggleOfflineMode={() => setIsOfflineMode(!isOfflineMode)}
            onBrowseMore={() => setActiveTab('home')}
          />
        )}

        {/* TAB: PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <div className="max-w-md mx-auto px-4 py-8">
            <ProfileModal
              isOpen={true}
              onClose={() => setActiveTab('home')}
              userProfile={userProfile}
              onOpenAuth={() => setIsAuthOpen(true)}
              onLogout={handleLogout}
              onOpenOwnerDashboard={() => setIsOwnerDashboardOpen(true)}
              onClearDownloads={handleClearAllDownloads}
              isOwner={isOwner}
            />
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation for Mobile */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        downloads={downloads}
        userProfile={userProfile}
      />

      {/* Movie Details Modal Sheet */}
      <MovieDetailModal
        movie={selectedMovieForDetails}
        onClose={() => setSelectedMovieForDetails(null)}
        onPlay={handlePlayMovie}
        onStartDownload={handleStartDownload}
        downloadedItemIds={downloadedMovieIds}
        isInWatchlist={selectedMovieForDetails ? userProfile.watchlist.includes(selectedMovieForDetails.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
        onRateMovie={handleRateMovie}
        userRating={
          selectedMovieForDetails
            ? userProfile.lovedIds.includes(selectedMovieForDetails.id)
              ? 'love'
              : userProfile.likedIds.includes(selectedMovieForDetails.id)
                ? 'like'
                : undefined
            : undefined
        }
      />

      {/* Full-Screen Video Player */}
      {activePlayingMovie && (
        <VideoPlayer
          movie={activePlayingMovie}
          episode={activePlayingEpisode}
          isOfflinePlayback={isPlayingDownloadedItem}
          onClose={() => {
            setActivePlayingMovie(null);
            setActivePlayingEpisode(undefined);
          }}
        />
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <SearchModal
          onClose={() => setIsSearchOpen(false)}
          onSelectMovie={(m) => {
            setIsSearchOpen(false);
            setSelectedMovieForDetails(m);
          }}
          onPlayMovie={(m) => {
            setIsSearchOpen(false);
            handlePlayMovie(m);
          }}
          onStartDownload={handleStartDownload}
          downloadedMovieIds={downloadedMovieIds}
        />
      )}

      {/* App Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenOwnerDashboard={() => setIsOwnerDashboardOpen(true)}
        onClearDownloads={handleClearAllDownloads}
        isOwner={isOwner}
      />

      {/* Authentication Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(profile) => {
          setUserProfile(profile);
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        }}
      />

      {/* Owner Analytics & User Stats Dashboard */}
      <OwnerDashboardModal
        isOpen={isOwnerDashboardOpen}
        onClose={() => setIsOwnerDashboardOpen(false)}
        currentUserEmail={userProfile.email}
        catalog={fullCatalog}
        onAddMovie={handleAddCustomMovie}
        onUpdateMovie={handleUpdateCustomMovie}
        onDeleteMovie={handleDeleteMovie}
      />
    </div>
  );
}






