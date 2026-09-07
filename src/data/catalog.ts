import { Movie, AppCategory } from '../types';

// High-reliability public domain & open video streams
const SAMPLE_VIDEOS = {
  tearsOfSteel: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  sintel: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  bigBuckBunny: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  elephantsDream: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  forBiggerBlazes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  weAreGoingOnBullrun: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  subaruOutback: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
};

export const APP_CATEGORIES: AppCategory[] = [
  'Tagalog Dubbed Movies',
  'Tagalog Dubbed Tv Series',
  'Tagalog Dubbed Anime Movies',
  'Tagalog Dubbed Anime Tv Series',
  'Pinoy Movies',
  'Encode By Reborn',
];

export const ENCODE_BY_REBORN_SUBCATEGORIES = [
  'Encode By Reborn Tagalog Dubbed Movies',
  'Encode By Reborn Tagalog Dubbed Anime Movies',
  'Encode By Reborn Tagalog Dubbed Anime Series',
  'Encode By Reborn Tagalog Dubbed Anime Movies No Watermark',
  'Encode By Reborn Tagalog Dubbed Anime Series No Watermark',
] as const;

export const GENRE_CATEGORIES = [
  'All',
  ...APP_CATEGORIES,
];

export const MOVIES_CATALOG: Movie[] = [];











