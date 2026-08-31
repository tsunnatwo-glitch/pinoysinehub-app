import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);

// Use the existing named Firestore database
export const db = getFirestore(
  app,
  'ai-studio-streamflixmobile-82ccc55a-2792-4e84-ada8-770da39b6155'
);

export default app;