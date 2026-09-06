import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { storage } from './firebase';

const isDataUrl = (value: string) => value.trim().startsWith('data:image/');

export const uploadImageIfNeeded = async (
  value: string,
  movieId: string,
  type: 'poster' | 'backdrop'
): Promise<string> => {
  const trimmed = value.trim();

  if (!trimmed || !isDataUrl(trimmed)) {
    return trimmed;
  }

  const imageRef = ref(
    storage,
    `movies/${movieId}/${type}.jpg`
  );

  await uploadString(imageRef, trimmed, 'data_url');

  return await getDownloadURL(imageRef);
};
