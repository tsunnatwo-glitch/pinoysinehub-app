import { DownloadedItem, UserProfile, QualityTier, ContentType } from '../types';

const STORAGE_KEYS = {
  DOWNLOADS: 'pinoysinehub_downloads_v1',
  USER_PROFILE: 'pinoysinehub_profile_v1',
  WATCH_PROGRESS: 'pinoysinehub_watch_progress_v1',
  OFFLINE_MODE: 'pinoysinehub_offline_mode_v1',
  SETTINGS: 'pinoysinehub_app_settings_v1',
  CUSTOM_MOVIES: 'pinoysinehub_custom_movies_v1',
  DELETED_MOVIES: 'pinoysinehub_deleted_movies_v1',
};

export const DEFAULT_PROFILE: UserProfile = {
  id: 'guest-viewer',
  name: 'Bisita',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  role: 'user',
  isAnonymous: true,
  createdAt: Date.now(),
  lastActiveAt: Date.now(),
  preferredGenres: ['Tagalog Dubbed Movies', 'Anime', 'Action'],
  watchlist: ['film-cyber-tadhana', 'film-quantum-drift', 'series-poblacion-nights'],
  likedIds: ['film-cyber-tadhana', 'film-anime-shinigami-blade'],
  lovedIds: ['film-cyber-tadhana'],
  history: [
    {
      movieId: 'film-cyber-tadhana',
      watchedAt: Date.now() - 3600000 * 24,
      progressPercentage: 92,
      lastPositionSec: 6200,
    },
  ],
  isPremiumAdFree: false,
  language: 'tl',
};

// Initial sample downloaded movie so user immediately sees offline viewing in action!
const DEFAULT_DOWNLOADS: DownloadedItem[] = [
  {
    id: 'dl-cyber-tadhana',
    movieId: 'film-cyber-tadhana',
    title: 'Cyber Tadhana (Neon Love 2099)',
    subTitle: 'Sci-Fi Romance • 1h 52m',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=80',
    duration: '1h 52m',
    quality: 'FHD (1080p)',
    fileSizeMB: 620,
    downloadedAt: Date.now() - 3600000 * 5,
    progress: 100,
    status: 'completed',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    type: 'movie',
  },
];

export const storageService = {
  getDownloads(): DownloadedItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOWNLOADS);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(DEFAULT_DOWNLOADS));
      return DEFAULT_DOWNLOADS;
    } catch {
      return DEFAULT_DOWNLOADS;
    }
  },

  saveDownloads(downloads: DownloadedItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(downloads));
    } catch (e) {
      console.error('Failed to save downloads:', e);
    }
  },

  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save user profile:', e);
    }
  },

  getOfflineMode(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE) === 'true';
    } catch {
      return false;
    }
  },

  setOfflineMode(offline: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, String(offline));
    } catch (e) {
      console.error('Failed to set offline mode:', e);
    }
  },

  getAppSettings(): {
    smartDownloads: boolean;
    downloadWifiOnly: boolean;
    defaultDownloadQuality: QualityTier;
    autoPlayNextEpisode: boolean;
    totalDeviceStorageGB: number;
    usedByOtherAppsGB: number;
  } {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch {}
    return {
      smartDownloads: true,
      downloadWifiOnly: true,
      defaultDownloadQuality: 'HD (720p)',
      autoPlayNextEpisode: true,
      totalDeviceStorageGB: 128,
      usedByOtherAppsGB: 46.5,
    };
  },

  saveAppSettings(settings: any): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save app settings:', e);
    }
  },

  getCustomMovies(): any[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_MOVIES);
      if (data) return JSON.parse(data);
      return [];
    } catch {
      return [];
    }
  },

  saveCustomMovies(movies: any[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_MOVIES, JSON.stringify(movies));
    } catch (e) {
      console.error('Failed to save custom movies:', e);
    }
  },

  getDeletedMovieIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DELETED_MOVIES);
      if (data) return JSON.parse(data);
      return [];
    } catch {
      return [];
    }
  },

  saveDeletedMovieIds(ids: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DELETED_MOVIES, JSON.stringify(ids));
    } catch (e) {
      console.error('Failed to save deleted movie IDs:', e);
    }
  },
};
