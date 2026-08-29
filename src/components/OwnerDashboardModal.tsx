import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  UserCheck,
  Eye,
  Bookmark,
  Search,
  RefreshCw,
  ShieldCheck,
  Calendar,
  Clock,
  Mail,
  Lock,
  Plus,
  Trash2,
  Pencil,
  Film,
  Tv,
  Library,
} from 'lucide-react';
import { Movie } from '../types';
import { UserStatsRecord } from '../types';
import { userService, OWNER_EMAIL, OWNER_PIN } from '../services/userService';
import { AddMovieForm } from './AddMovieForm';

interface OwnerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
  catalog: Movie[];
  onAddMovie: (newMovie: Movie) => void;
  onUpdateMovie: (updatedMovie: Movie) => void;
  onDeleteMovie: (movieId: string) => void;
}

export const OwnerDashboardModal: React.FC<OwnerDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
  catalog,
  onAddMovie,
  onUpdateMovie,
  onDeleteMovie,
}) => {
  const [users, setUsers] = useState<UserStatsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'registered' | 'guests'>('all');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [isAddMovieOpen, setIsAddMovieOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [contentSearch, setContentSearch] = useState('');

  useEffect(() => {
    if (currentUserEmail && currentUserEmail.toLowerCase().trim() === OWNER_EMAIL.toLowerCase()) {
      setIsUnlocked(true);
    }
  }, [currentUserEmail, isOpen]);

  useEffect(() => {
    if (!isOpen || !isUnlocked) return;

    setLoading(true);
    const unsubscribe = userService.subscribeAllUsers((userList) => {
      setUsers(userList);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isOpen, isUnlocked]);

  if (!isOpen) return null;

  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === OWNER_PIN) {
      setIsUnlocked(true);
      setPasscodeError('');
    } else {
      setPasscodeError('Maling PIN Code. Pakisubukan muli.');
    }
  };

  const handleManualRefresh = async () => {
    setLoading(true);
    const list = await userService.fetchAllUsers();
    setUsers(list);
    setLoading(false);
  };

  const handleDelete = (movie: Movie) => {
    const confirmed = window.confirm(
      `Burahin ang "${movie.title}"?\n\nHindi na ito lalabas sa catalog na ito.`
    );
    if (confirmed) onDeleteMovie(movie.id);
  };

  const totalRegistered = users.filter((u) => !u.isAnonymous && u.email && u.email !== 'No Email').length;
  const totalGuests = users.filter((u) => u.isAnonymous || !u.email || u.email === 'Guest Viewer').length;
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const activeLast24h = users.filter((u) => u.lastActiveAt > oneDayAgo).length;
  const totalWatchlists = users.reduce((acc, curr) => acc + (curr.watchlistCount || 0), 0);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (filterType === 'registered') return !u.isAnonymous && u.email && u.email !== 'No Email' && u.email !== 'Guest Viewer';
    if (filterType === 'guests') return u.isAnonymous || !u.email || u.email === 'Guest Viewer';
    return true;
  });

  const filteredContent = catalog.filter((movie) =>
    movie.title.toLowerCase().includes(contentSearch.toLowerCase()) ||
    movie.category?.toLowerCase().includes(contentSearch.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Walang tala';
    const d = new Date(timestamp);
    return d.toLocaleDateString('fil-PH', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const formatRelativeTime = (timestamp: number) => {
    if (!timestamp) return 'Hindi aktibo';
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'Kani-kanina lang (Online)';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ang nakalipas`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ang nakalipas`;
    return `${Math.floor(diffSec / 86400)} araw ang nakalipas`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-md shadow-amber-950">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">👑 May-ari / Analytics Dashboard</h2>
                <span className="text-[10px] bg-amber-500 text-black font-black px-2 py-0.5 rounded-full">Owner Portal</span>
              </div>
              <p className="text-[11px] text-neutral-400">Pribadong datos ng mga nag-sign up at gumagamit sa Pinoysinehub</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isUnlocked ? (
          <div className="p-8 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-amber-400"><Lock className="w-8 h-8" /></div>
            <h3 className="text-lg font-bold text-white">Owner Security Check</h3>
            <p className="text-xs text-neutral-400">Ikaw lamang (ang may-ari ng app) ang may karapatang makakita sa analytics at listahan ng mga users. Ilagay ang iyong Owner PIN code o mag-sign in gamit ang <span className="text-amber-400 font-mono">{OWNER_EMAIL}</span>.</p>
            <form onSubmit={handleUnlockWithPin} className="space-y-3">
              <input type="password" placeholder="Ilagay ang iyong 6-digit Owner PIN" value={passcode} onChange={(e) => setPasscode(e.target.value)} className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-center text-white focus:outline-none focus:border-amber-400 font-mono tracking-widest text-base" autoFocus />
              {passcodeError && <p className="text-xs text-red-400 font-medium">{passcodeError}</p>}
              <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-colors">I-unlock ang Owner Analytics</button>
            </form>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Content manager: added without changing the main app layout. */}
            <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-white font-bold text-sm"><Library className="w-4 h-4 text-amber-400" /> Content Manager</div>
                  <p className="text-[10px] text-neutral-500 mt-1">Magdagdag gamit ang Embed Link/Code at burahin ang sample o custom content.</p>
                </div>
                <button onClick={() => { setEditingMovie(null); setIsAddMovieOpen(true); }} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#E50914] hover:bg-red-600 text-white font-bold text-xs transition-colors shrink-0">
                  <Plus className="w-4 h-4" /> Magdagdag ng Pelikula / Series
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input value={contentSearch} onChange={(e) => setContentSearch(e.target.value)} placeholder="Hanapin ang movie o series..." className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2 pl-8 pr-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400" />
                </div>
                <span className="text-[10px] text-neutral-500 shrink-0">{filteredContent.length} content</span>
              </div>

              <div className="mt-3 max-h-56 overflow-y-auto space-y-2">
                {filteredContent.length === 0 ? (
                  <div className="py-7 text-center border border-dashed border-neutral-800 rounded-lg text-xs text-neutral-600">
                    <Film className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    Wala pang content. Magdagdag ng unang movie o series.
                  </div>
                ) : filteredContent.map((movie) => (
                  <div key={movie.id} className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-lg p-2">
                    <img src={movie.poster} alt="" className="w-9 h-12 rounded object-cover bg-neutral-800 shrink-0" referrerPolicy="no-referrer" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">{movie.title}</div>
                      <div className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                        {movie.type === 'series' ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                        <span className="truncate">{movie.category || 'Walang category'}</span>
                      </div>
                    </div>
                    <button onClick={() => { setEditingMovie(movie); setIsAddMovieOpen(true); }} title="I-edit" className="p-2 rounded-lg text-neutral-500 hover:text-amber-400 hover:bg-amber-950/30 transition-colors shrink-0">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(movie)} title="Burahin" className="p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/30 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 relative overflow-hidden"><div className="absolute top-0 right-0 w-16 h-16 bg-red-600/10 rounded-bl-full" /><div className="flex items-center gap-2 text-neutral-400 text-xs font-semibold mb-1"><Users className="w-4 h-4 text-red-500" /><span>Nag-Sign Up (Users)</span></div><div className="text-2xl sm:text-3xl font-black text-white">{totalRegistered}</div><div className="text-[10px] text-emerald-400 mt-1 font-medium">Naka-save sa Firebase Cloud</div></div>
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 relative overflow-hidden"><div className="absolute top-0 right-0 w-16 h-16 bg-emerald-600/10 rounded-bl-full" /><div className="flex items-center gap-2 text-neutral-400 text-xs font-semibold mb-1"><UserCheck className="w-4 h-4 text-emerald-500" /><span>Aktibo (24 Hours)</span></div><div className="text-2xl sm:text-3xl font-black text-white">{activeLast24h}</div><div className="text-[10px] text-neutral-400 mt-1">Online / Nag-stream ngayon</div></div>
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 relative overflow-hidden"><div className="absolute top-0 right-0 w-16 h-16 bg-amber-600/10 rounded-bl-full" /><div className="flex items-center gap-2 text-neutral-400 text-xs font-semibold mb-1"><Eye className="w-4 h-4 text-amber-500" /><span>Guest / Bisita</span></div><div className="text-2xl sm:text-3xl font-black text-white">{totalGuests}</div><div className="text-[10px] text-neutral-400 mt-1">Nanonood nang walang account</div></div>
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 relative overflow-hidden"><div className="absolute top-0 right-0 w-16 h-16 bg-purple-600/10 rounded-bl-full" /><div className="flex items-center gap-2 text-neutral-400 text-xs font-semibold mb-1"><Bookmark className="w-4 h-4 text-purple-400" /><span>Total Watchlist Saves</span></div><div className="text-2xl sm:text-3xl font-black text-white">{totalWatchlists}</div><div className="text-[10px] text-neutral-400 mt-1">Mga paboritong Tagalog Dubbed</div></div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <div className="relative flex-1"><Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" /><input type="text" placeholder="Maghanap ayon sa pangalan, email, o user ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400" /></div>
              <div className="flex items-center gap-2"><div className="flex bg-neutral-900 rounded-lg p-0.5 border border-neutral-700 text-xs"><button onClick={() => setFilterType('all')} className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${filterType === 'all' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'}`}>Lahat ({users.length})</button><button onClick={() => setFilterType('registered')} className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${filterType === 'registered' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'}`}>Naka-Sign Up ({totalRegistered})</button><button onClick={() => setFilterType('guests')} className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${filterType === 'guests' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'}`}>Guests ({totalGuests})</button></div><button onClick={handleManualRefresh} disabled={loading} title="I-refresh ang database" className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white hover:border-amber-400 transition-colors"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} /></button></div>
            </div>

            <div className="bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400"><span className="font-bold text-white uppercase tracking-wider text-[11px]">Talaan ng mga Gumagamit ({filteredUsers.length})</span><span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Realtime Cloud Sync</span></div>
              {loading && users.length === 0 ? <div className="py-12 text-center text-xs text-neutral-500"><div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-2" />Kinakarga ang mga datos mula sa Firebase...</div> : filteredUsers.length === 0 ? <div className="py-12 text-center text-xs text-neutral-500">Walang nakitang user sa paghahanap.</div> : <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-neutral-900/60 text-neutral-400 border-b border-neutral-800 text-[10px] uppercase font-bold tracking-wider"><tr><th className="px-4 py-3">Pangalan / User</th><th className="px-4 py-3">Email Address</th><th className="px-4 py-3">Petsa ng Pag-Sign Up</th><th className="px-4 py-3">Huling Aktibo</th><th className="px-4 py-3 text-center">Watchlist</th><th className="px-4 py-3 text-right">Status</th></tr></thead><tbody className="divide-y divide-neutral-850">{filteredUsers.map((user) => { const isOwnerAccount = user.email?.toLowerCase().trim() === OWNER_EMAIL.toLowerCase() || user.role === 'owner'; return <tr key={user.id} className={`hover:bg-neutral-900/50 transition-colors ${isOwnerAccount ? 'bg-amber-500/5' : ''}`}><td className="px-4 py-3"><div className="flex items-center gap-2.5"><img src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} alt={user.name} className="w-8 h-8 rounded-lg object-cover border border-neutral-700" referrerPolicy="no-referrer" /><div><div className="font-bold text-white flex items-center gap-1.5"><span>{user.name}</span>{isOwnerAccount && <span className="text-[9px] bg-amber-500 text-black font-black px-1.5 py-0.2 rounded">MAY-ARI</span>}</div><span className="text-[10px] text-neutral-500 font-mono">ID: {user.id.slice(0, 8)}...</span></div></div></td><td className="px-4 py-3 font-mono text-neutral-300">{user.email && user.email !== 'No Email' ? <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-neutral-500" /><span>{user.email}</span></span> : <span className="text-neutral-500 italic">Guest (Walang email)</span>}</td><td className="px-4 py-3 text-neutral-400"><span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-neutral-500" /><span>{formatDate(user.createdAt)}</span></span></td><td className="px-4 py-3 text-neutral-300"><span className="flex items-center gap-1"><Clock className="w-3 h-3 text-neutral-500" /><span>{formatRelativeTime(user.lastActiveAt)}</span></span></td><td className="px-4 py-3 text-center font-bold text-neutral-200"><span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">{user.watchlistCount || 0}</span></td><td className="px-4 py-3 text-right">{isOwnerAccount ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">Admin / Owner</span> : !user.isAnonymous && user.email ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Rehistrado</span> : <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">Bisita</span>}</td></tr>; })}</tbody></table></div>}
            </div>
          </div>
        )}

        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400"><span>Pinoysinehub Analytics • Eksklusibo para sa <strong className="text-white">{OWNER_EMAIL}</strong></span><button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors">Isara</button></div>
      </div>

      <AddMovieForm
        isOpen={isAddMovieOpen}
        editingMovie={editingMovie}
        onClose={() => { setIsAddMovieOpen(false); setEditingMovie(null); }}
        onAddMovie={(movie) => { onAddMovie(movie); setIsAddMovieOpen(false); setEditingMovie(null); }}
        onUpdateMovie={(movie) => { onUpdateMovie(movie); setIsAddMovieOpen(false); setEditingMovie(null); }}
      />
    </div>
  );
};
