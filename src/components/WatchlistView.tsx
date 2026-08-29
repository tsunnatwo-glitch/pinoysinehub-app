import React from 'react';
import { Bookmark, Play, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Movie } from '../types';

interface WatchlistViewProps {
  watchlistMovieIds: string[];
  allMovies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onPlayMovie: (movie: Movie) => void;
  onRemoveFromWatchlist: (movieId: string) => void;
  onBrowseMore: () => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  watchlistMovieIds,
  allMovies,
  onSelectMovie,
  onPlayMovie,
  onRemoveFromWatchlist,
  onBrowseMore,
}) => {
  const savedMovies = watchlistMovieIds
    .map((id) => allMovies.find((m) => m.id === id))
    .filter(Boolean) as Movie[];

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-[#E50914] fill-[#E50914]" />
            <span>Aking Listahan (Watchlist)</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Mga naka-save na Tagalog Dubbed movies at serye na nais mong panoorin
          </p>
        </div>
        <button
          onClick={onBrowseMore}
          className="text-xs text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Mag-browse Pa</span>
        </button>
      </div>

      {savedMovies.length === 0 ? (
        <div className="py-20 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Wala pang naka-save sa iyong listahan</h3>
          <p className="text-xs text-neutral-400">
            Pumili ng anumang pelikula o serye sa Home at i-click ang "+ I-save sa Listahan" para mapanood mo mamaya.
          </p>
          <button
            onClick={onBrowseMore}
            className="px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#ff1f2a] text-white font-bold text-xs shadow-lg transition-all active:scale-95 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Maghanap ng Palabas</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {savedMovies.map((movie) => (
            <div
              key={movie.id}
              className="group relative bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-600 transition-all hover:scale-[1.02] flex flex-col"
            >
              {/* Poster */}
              <div
                onClick={() => onSelectMovie(movie)}
                className="relative aspect-[2/3] cursor-pointer overflow-hidden bg-neutral-950"
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <span className="text-[10px] text-emerald-400 font-bold">{movie.matchScore}% Match</span>
                  <p className="text-xs font-bold text-white line-clamp-1">{movie.title}</p>
                </div>
              </div>

              {/* Action bar below poster */}
              <div className="p-2.5 bg-neutral-950 flex items-center justify-between border-t border-neutral-850">
                <button
                  onClick={() => onPlayMovie(movie)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-[#E50914] hover:bg-[#ff1f2a] text-white text-xs font-bold flex items-center justify-center gap-1 shadow transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>I-play</span>
                </button>
                <button
                  onClick={() => onRemoveFromWatchlist(movie.id)}
                  className="p-1.5 ml-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-850 transition-colors"
                  title="Alisin sa listahan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
