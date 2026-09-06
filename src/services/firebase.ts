import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('Firebase auth persistence setup failed:', error);
});

export const db = getFirestore(
  app,
  'ai-studio-streamflixmobile-82ccc55a-2792-4e84-ada8-770da39b6155'
);

export const storage = getStorage(app);

export default app;
