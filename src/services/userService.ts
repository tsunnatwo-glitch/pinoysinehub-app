import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserStatsRecord } from '../types';
import { storageService } from './storageService';

export const OWNER_EMAIL = 'tsunnatwo@gmail.com';
export const OWNER_PIN = '102191';

// Fixed profile image for the PinoySinehub Owner account.
const OWNER_AVATAR = '/src/assets/owner-avatar.png';

// Random attractive avatars for Filipino users
const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
];

function getRandomAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

// Helper with timeout to prevent Firebase promises from hanging indefinitely in preview/sandboxes
async function withTimeout<T>(promise: Promise<T>, ms: number = 3000): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Auth request timed out')), ms);
  });
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timeoutId);
      return res;
    }),
    timeoutPromise,
  ]);
}

export const userService = {
  // Check if current user is owner
  isOwner(profile?: UserProfile | null): boolean {
    if (!profile) return false;
    if (profile.email && profile.email.toLowerCase().trim() === OWNER_EMAIL.toLowerCase()) {
      return true;
    }
    if (profile.role === 'owner' || profile.role === 'admin') {
      return true;
    }
    return false;
  },

  // Register with email and password
  async registerUser(name: string, email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.toLowerCase().trim();
    const isOwner = cleanEmail === OWNER_EMAIL.toLowerCase();
    const chosenAvatar = isOwner ? OWNER_AVATAR : getRandomAvatar();
    const uid = isOwner ? 'owner-tsunnatwo' : 'usr-' + Date.now();

    const newProfile: UserProfile = {
      id: uid,
      name: name.trim() || (isOwner ? 'Owner (Pinoysinehub Admin)' : 'Pinoy SineHub Viewer'),
      email: cleanEmail,
      avatar: chosenAvatar,
      role: isOwner ? 'owner' : 'user',
      isAnonymous: false,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      preferredGenres: ['Tagalog Dubbed Movies', 'Action', 'Anime'],
      watchlist: storageService.getUserProfile().watchlist || [],
      likedIds: storageService.getUserProfile().likedIds || [],
      lovedIds: storageService.getUserProfile().lovedIds || [],
      history: storageService.getUserProfile().history || [],
      isPremiumAdFree: isOwner ? true : false,
      language: 'tl',
    };

    // Save immediately so user proceeds in 0.05 seconds!
    storageService.saveUserProfile(newProfile);

    // Asynchronously perform Firebase Auth & Firestore write in background without blocking UI
    (async () => {
      try {
        const userCredential = await withTimeout(
          createUserWithEmailAndPassword(auth, cleanEmail, password),
          4000
        );
        if (userCredential?.user) {
          updateFirebaseProfile(userCredential.user, {
            displayName: newProfile.name,
            photoURL: chosenAvatar,
          }).catch(() => {});
        }
      } catch (err: any) {
        // If account exists, try background sign in
        if (err?.code === 'auth/email-already-in-use') {
          signInWithEmailAndPassword(auth, cleanEmail, password).catch(() => {});
        }
      }
      this.saveProfileToFirestore(newProfile).catch(() => {});
    })();

    return newProfile;
  },

  // Login with email and password
  async loginUser(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.toLowerCase().trim();
    const isOwner = cleanEmail === OWNER_EMAIL.toLowerCase();
    const uid = isOwner ? 'owner-tsunnatwo' : 'usr-' + Date.now();
    const displayName = isOwner ? 'Owner (Pinoysinehub Admin)' : 'Pinoysinehub Viewer';

    const localProfile = storageService.getUserProfile();
    const profile: UserProfile = {
      id: localProfile?.id || uid,
      name: localProfile?.email === cleanEmail ? localProfile.name : displayName,
      email: cleanEmail,
      avatar: isOwner ? OWNER_AVATAR : (localProfile?.avatar || getRandomAvatar()),
      role: isOwner ? 'owner' : 'user',
      isAnonymous: false,
      createdAt: localProfile?.createdAt || Date.now(),
      lastActiveAt: Date.now(),
      preferredGenres: ['Tagalog Dubbed Movies', 'Anime'],
      watchlist: localProfile?.watchlist || [],
      likedIds: localProfile?.likedIds || [],
      lovedIds: localProfile?.lovedIds || [],
      history: localProfile?.history || [],
      isPremiumAdFree: isOwner ? true : false,
      language: 'tl',
    };

    // Save immediately to local storage
    storageService.saveUserProfile(profile);

    // Asynchronously authenticate with Firebase in background
    (async () => {
      try {
        await withTimeout(
          signInWithEmailAndPassword(auth, cleanEmail, password),
          4000
        );
      } catch (e) {
        // If user doesn't exist yet in Firebase, auto-create in background
        createUserWithEmailAndPassword(auth, cleanEmail, password).catch(() => {});
      }
      this.saveProfileToFirestore(profile).catch(() => {});
    })();

    return profile;
  },

  // Quick 1-Click Owner Login for testing/preview without password obstacles
  async quickOwnerLogin(): Promise<UserProfile> {
    const ownerProfile: UserProfile = {
      id: 'owner-tsunnatwo',
      name: 'Owner (Pinoysinehub Admin)',
      email: OWNER_EMAIL,
      avatar: OWNER_AVATAR,
      role: 'owner',
      isAnonymous: false,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      preferredGenres: ['Tagalog Dubbed Movies', 'Anime', 'Action'],
      watchlist: storageService.getUserProfile().watchlist || [],
      likedIds: storageService.getUserProfile().likedIds || [],
      lovedIds: storageService.getUserProfile().lovedIds || [],
      history: storageService.getUserProfile().history || [],
      isPremiumAdFree: true,
      language: 'tl',
    };

    // Save immediately so UI updates in milliseconds
    storageService.saveUserProfile(ownerProfile);

    // Save to firestore in background
    this.saveProfileToFirestore(ownerProfile).catch(() => {});

    return ownerProfile;
  },

  // Login as Guest
  async loginAsGuest(guestName?: string): Promise<UserProfile> {
    let uid = 'guest-' + Date.now();
    try {
      const res = await signInAnonymously(auth);
      if (res.user?.uid) {
        uid = res.user.uid;
      }
    } catch (err) {
      console.warn('Anonymous auth offline/fallback:', err);
    }

    const guestProfile: UserProfile = {
      id: uid,
      name: guestName?.trim() || `Bisita-${Math.floor(1000 + Math.random() * 9000)}`,
      email: '',
      avatar: getRandomAvatar(),
      role: 'user',
      isAnonymous: true,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      preferredGenres: ['Tagalog Dubbed Movies', 'Anime'],
      watchlist: [],
      likedIds: [],
      lovedIds: [],
      history: [],
      isPremiumAdFree: false,
      language: 'tl',
    };

    try {
      await this.saveProfileToFirestore(guestProfile);
    } catch (e) {
      console.warn('Could not save guest to Firestore', e);
    }
    storageService.saveUserProfile(guestProfile);
    return guestProfile;
  },

  createFreshGuest(): UserProfile {
    return {
      id: 'guest-' + Date.now(),
      name: 'Bisita',
      email: '',
      avatar: getRandomAvatar(),
      role: 'user',
      isAnonymous: true,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      preferredGenres: ['Tagalog Dubbed Movies', 'Anime'],
      watchlist: [],
      likedIds: [],
      lovedIds: [],
      history: [],
      isPremiumAdFree: false,
      language: 'tl',
    };
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await withTimeout(signOut(auth), 1500);
    } catch (e) {
      console.warn('SignOut error', e);
    }
  },

  async signOutUser(): Promise<void> {
    return this.logout();
  },

  // Save profile to Firestore
  async saveProfileToFirestore(profile: UserProfile): Promise<void> {
    try {
      const docRef = doc(db, 'users', profile.id);
      const dataToSave = {
        id: profile.id,
        name: profile.name || 'Pinoy SineHub Viewer',
        email: profile.email || '',
        avatar: profile.avatar || getRandomAvatar(),
        role: profile.role || 'user',
        isAnonymous: Boolean(profile.isAnonymous),
        createdAt: profile.createdAt || Date.now(),
        lastActiveAt: Date.now(),
        watchlist: profile.watchlist || [],
        likedIds: profile.likedIds || [],
        lovedIds: profile.lovedIds || [],
        watchlistCount: profile.watchlist?.length || 0,
        likedCount: (profile.likedIds?.length || 0) + (profile.lovedIds?.length || 0),
        historyCount: profile.history?.length || 0,
        isPremiumAdFree: Boolean(profile.isPremiumAdFree),
        language: profile.language || 'tl',
      };
      await setDoc(docRef, dataToSave, { merge: true });
    } catch (error) {
      console.error('Firestore saveProfile error:', error);
    }
  },

  async syncUserProfileToCloud(profile: UserProfile): Promise<void> {
    return this.saveProfileToFirestore(profile);
  },

  // Get single user profile from Firestore
  async getProfileFromFirestore(userId: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          id: data.id || userId,
          name: data.name || 'Viewer',
          email: data.email || '',
          avatar: data.avatar || getRandomAvatar(),
          role: data.role || 'user',
          isAnonymous: Boolean(data.isAnonymous),
          createdAt: data.createdAt || Date.now(),
          lastActiveAt: data.lastActiveAt || Date.now(),
          preferredGenres: data.preferredGenres || ['Tagalog Dubbed Movies'],
          watchlist: data.watchlist || [],
          likedIds: data.likedIds || [],
          lovedIds: data.lovedIds || [],
          history: data.history || [],
          isPremiumAdFree: Boolean(data.isPremiumAdFree),
          language: data.language || 'tl',
        };
      }
      return null;
    } catch (err) {
      console.error('Firestore getProfile error:', err);
      return null;
    }
  },

  // Listen to Auth State and sync full profile
  subscribeAuth(callback: (profile: UserProfile | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }
      const cloudProfile = await this.getProfileFromFirestore(firebaseUser.uid);
      if (cloudProfile) {
        callback(cloudProfile);
      } else {
        const isOwner = (firebaseUser.email || '').toLowerCase().trim() === OWNER_EMAIL.toLowerCase();
        const fallback: UserProfile = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Pinoysinehub Viewer',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || getRandomAvatar(),
          role: isOwner ? 'owner' : 'user',
          isAnonymous: firebaseUser.isAnonymous,
          createdAt: Date.now(),
          lastActiveAt: Date.now(),
          preferredGenres: ['Tagalog Dubbed Movies'],
          watchlist: [],
          likedIds: [],
          lovedIds: [],
          history: [],
          isPremiumAdFree: isOwner,
          language: 'tl',
        };
        await this.saveProfileToFirestore(fallback);
        callback(fallback);
      }
    });
  },

  // Owner Exclusive: Subscribe to All Users Realtime
  subscribeAllUsers(callback: (users: UserStatsRecord[]) => void) {
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('lastActiveAt', 'desc'), limit(150));
      return onSnapshot(
        usersQuery,
        (snapshot) => {
          const userList: UserStatsRecord[] = [];
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            userList.push({
              id: d.id || docSnap.id,
              name: d.name || 'Pinoysinehub User',
              email: d.email || (d.isAnonymous ? 'Guest Viewer' : 'No Email'),
              avatar: d.avatar,
              role: d.role || (d.email === OWNER_EMAIL ? 'owner' : 'user'),
              isAnonymous: Boolean(d.isAnonymous),
              createdAt: d.createdAt || Date.now(),
              lastActiveAt: d.lastActiveAt || Date.now(),
              watchlistCount: d.watchlistCount || (d.watchlist?.length || 0),
              likedCount: d.likedCount || (d.likedIds?.length || 0) + (d.lovedIds?.length || 0),
              historyCount: d.historyCount || (d.history?.length || 0),
            });
          });
          callback(userList);
        },
        (error) => {
          console.error('Realtime users subscription error:', error);
          this.fetchAllUsers().then(callback);
        }
      );
    } catch (err) {
      console.error('subscribeAllUsers failed:', err);
      this.fetchAllUsers().then(callback);
      return () => {};
    }
  },

  // Owner Exclusive: One-time fetch of all users
  async fetchAllUsers(): Promise<UserStatsRecord[]> {
    try {
      const usersCol = collection(db, 'users');
      const snapshot = await getDocs(usersCol);
      const userList: UserStatsRecord[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        userList.push({
          id: d.id || docSnap.id,
          name: d.name || 'Pinoysinehub User',
          email: d.email || (d.isAnonymous ? 'Guest Viewer' : 'No Email'),
          avatar: d.avatar,
          role: d.role || (d.email === OWNER_EMAIL ? 'owner' : 'user'),
          isAnonymous: Boolean(d.isAnonymous),
          createdAt: d.createdAt || Date.now(),
          lastActiveAt: d.lastActiveAt || Date.now(),
          watchlistCount: d.watchlistCount || (d.watchlist?.length || 0),
          likedCount: d.likedCount || (d.likedIds?.length || 0) + (d.lovedIds?.length || 0),
          historyCount: d.historyCount || (d.history?.length || 0),
        });
      });
      return userList.sort((a, b) => b.lastActiveAt - a.lastActiveAt);
    } catch (error) {
      console.error('fetchAllUsers error:', error);
      return [];
    }
  },
};
