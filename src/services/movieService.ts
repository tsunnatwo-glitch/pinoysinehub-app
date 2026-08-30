import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Movie } from '../types';

const MOVIES_COLLECTION = 'movies';

export const movieService = {
  async getCustomMovies(): Promise<Movie[]> {
    const snapshot = await getDocs(collection(db, MOVIES_COLLECTION));

    return snapshot.docs.map((docSnap) => ({
      ...docSnap.data(),
      id: docSnap.id,
    })) as Movie[];
  },

  async saveMovie(movie: Movie): Promise<void> {
    await setDoc(doc(db, MOVIES_COLLECTION, movie.id), movie);
  },

  async deleteMovie(movieId: string): Promise<void> {
    await deleteDoc(doc(db, MOVIES_COLLECTION, movieId));
  },
};
