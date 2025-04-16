// API related constants
export const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
export const baseURL = "https://api.themoviedb.org/3";

// Image URL constants for different resolution requirements
export const imageUrlOriginal = "https://image.tmdb.org/t/p/original"; // High-resolution images
export const imageUrlBackup = "https://image.tmdb.org/t/p/w500"; // Medium-resolution images

/**
 * Language code to display name mapping
 * Used for converting ISO language codes to human-readable names
 */
export const languageList = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  ru: "Russian",
  pt: "Portuguese",
  hi: "Hindi",
  ar: "Arabic",
  tr: "Turkish",
  th: "Thai",
};

/**
 * List of countries for region selection
 * Each entry contains the ISO country code and display name
 */
export const countriesList = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "HK", name: "Hong Kong" },
  { code: "CN", name: "China" },
];

/**
 * Movie genre definitions from TMDB API
 * Contains ID and display name for each genre
 */
export const genresList = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

// User interface constants
/**
 * Status options for user movie tracking
 */
export const statusOptions = ["Plan to Watch", "Completed", "Dropped"];

/**
 * Score options with descriptive labels for rating movies
 * Scale from 1-10 with qualitative descriptions
 */
export const scoreOptions = [
  { value: 1, label: "(1) Appalling" },
  { value: 2, label: "(2) Horrible" },
  { value: 3, label: "(3) Very Bad" },
  { value: 4, label: "(4) Bad" },
  { value: 5, label: "(5) Average" },
  { value: 6, label: "(6) Fine" },
  { value: 7, label: "(7) Good" },
  { value: 8, label: "(8) Very Good" },
  { value: 9, label: "(9) Great" },
  { value: 10, label: "(10) Masterpiece" },
];
