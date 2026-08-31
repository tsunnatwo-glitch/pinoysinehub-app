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

const removeUndefined = (value: any): any => {
  if (Array.isArray(value)) {
    return value.map(removeUndefined);
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .map(([key, v]) => [key, removeUndefined(v)])
    );
  }

  return value;
};

export const movieService = {
  async getCustomMovies(): Promise<Movie[]> {
    const snapshot = await getDocs(collection(db, MOVIES_COLLECTION));

    return snapshot.docs.map((docSnap) => ({
      ...docSnap.data(),
      id: docSnap.id,
    })) as Movie[];
  },

  async saveMovie(movie: Movie): Promise<void> {
    const cleanMovie = removeUndefined(movie);

    await setDoc(
      doc(db, MOVIES_COLLECTION, movie.id),
      cleanMovie
    );
  },

  async deleteMovie(movieId: string): Promise<void> {
    await deleteDoc(doc(db, MOVIES_COLLECTION, movieId));
  },
};