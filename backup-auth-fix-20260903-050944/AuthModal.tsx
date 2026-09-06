import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { userService, OWNER_EMAIL } from '../services/userService';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (profile: UserProfile) => void;
  onAuthSuccess?: (profile: UserProfile) => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onAuthSuccess,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const triggerSuccess = (p: UserProfile) => {
    if (onSuccess) onSuccess(p);
    if (onAuthSuccess) onAuthSuccess(p);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Pakilagay ang iyong Email at Password.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMsg('Pakilagay ang iyong Pangalan.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Ang password ay dapat may hindi bababa sa 6 na characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Hindi nagtutugma ang Password at Kumpirmasyon.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const profile = await userService.registerUser(name, email, password);
        setSuccessMsg('Matagumpay na nakagawa ng account! Maligayang pagdating sa Pinoysinehub.');
        setTimeout(() => {
          triggerSuccess(profile);
          onClose();
        }, 150);
      } else {
        const profile = await userService.loginUser(email, password);
        setSuccessMsg('Maligayang pagbabalik, ' + profile.name + '!');
        setTimeout(() => {
          triggerSuccess(profile);
          onClose();
        }, 150);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Ang email na ito ay mayroon nang rehistradong account. Subukang mag-sign in.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setErrorMsg('Maling email o password. Pakisuri muli ang iyong impormasyon.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Masyadong mahina ang password. Gumamit ng mas mahabang kombinasyon.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Hindi wasto ang format ng email address.');
      } else {
        setErrorMsg(err.message || 'Nagkaroon ng problema sa pag-connect. Pakisubukan muli.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const guestProfile = await userService.loginAsGuest();
      triggerSuccess(guestProfile);
      onClose();
    } catch (e) {
      console.error(e);
      setErrorMsg('Hindi ma-load ang guest mode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative ambient glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#E50914]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 mb-2 shadow-lg shadow-red-950">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            {mode === 'signin' ? 'Mag-Sign In sa Pinoysinehub' : 'Gumawa ng Libreng Account'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {mode === 'signin'
              ? 'I-access ang iyong Watchlist, Downloads, at Tagalog Dubbed streaming.'
              : 'Libreng manood ng Tagalog Dubbed Movies, Series, at Anime.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-950 rounded-xl border border-neutral-800 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signin'
                ? 'bg-[#E50914] text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Mag-Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signup'
                ? 'bg-[#E50914] text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Mag-Sign Up</span>
          </button>
        </div>

        {/* Quick Owner 1-Click Access - ONLY visible when owner email is typed or detected */}
        {email.toLowerCase().trim() === OWNER_EMAIL.toLowerCase() && (
          <div className="mb-4 p-2.5 bg-gradient-to-r from-amber-500/15 via-neutral-950 to-neutral-950 border border-amber-500/40 rounded-xl flex items-center justify-between animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2">
              <span className="text-base">👑</span>
              <div className="text-left">
                <span className="text-[11px] font-bold text-amber-400 block leading-tight">
                  Owner Verified ({OWNER_EMAIL})
                </span>
                <span className="text-[10px] text-neutral-400">
                  Ikaw ang May-ari ng App — pindutin para instant login
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                setErrorMsg('');
                try {
                  const ownerProfile = await userService.quickOwnerLogin();
                  setSuccessMsg('Maligayang pagdating, Owner (' + OWNER_EMAIL + ')!');
                  setTimeout(() => {
                    triggerSuccess(ownerProfile);
                    onClose();
                  }, 150);
                } catch (e: any) {
                  setErrorMsg(e.message || 'Error sa quick owner login');
                } finally {
                  setLoading(false);
                }
              }}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-black shadow transition-all active:scale-95 whitespace-nowrap"
            >
              Auto Sign-In 👑
            </button>
          </div>
        )}

        {/* Error and Success Feedback */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-xs text-red-300 font-medium">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Pangalan o Nickname
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Hal. Juan Dela Cruz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914] transition-colors"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="Hal. juan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914] transition-colors"
                required
              />
            </div>
            {email.toLowerCase().trim() === OWNER_EMAIL && (
              <p className="text-[10px] text-amber-400 font-semibold mt-1">
                👑 Owner Account Detected ({OWNER_EMAIL})
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Hindi bababa sa 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914] transition-colors"
                required
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Kumpirmahin ang Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Ulitin ang iyong password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914] transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#E50914] hover:bg-[#ff1f2a] text-white font-bold text-xs shadow-lg shadow-red-950 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Pumasok / Mag-Sign In</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Kumpletuhin ang Pag-Sign Up</span>
              </>
            )}
          </button>
        </form>

        {/* Guest Mode Divider */}
        <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            className="text-xs text-neutral-400 hover:text-neutral-200 underline font-medium"
          >
            Manood muna bilang Bisita (Guest Mode)
          </button>

          <span className="text-[10px] text-neutral-500">
            Pinoysinehub 2026
          </span>
        </div>
      </div>
    </div>
  );
};
