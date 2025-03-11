export const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
export const baseURL = "https://api.themoviedb.org/3";
export const imageURL = "https://image.tmdb.org/t/p/original";
export const imageURL2 = "https://image.tmdb.org/t/p/w500";

// Languages mapping for common language codes
export const languageMap = {
  "en": "English",
  "es": "Spanish",
  "fr": "French",
  "de": "German",
  "it": "Italian",
  "ja": "Japanese",
  "ko": "Korean",
  "zh": "Chinese",
  "ru": "Russian",
  "pt": "Portuguese",
  "hi": "Hindi",
  "ar": "Arabic",
  "tr": "Turkish",
  "th": "Thai"
  // This is just a basic set. The complete list will be fetched from the API
};

export const genresList = [
      {
        "id": 28,
        "name": "Action"
      },
      {
        "id": 12,
        "name": "Adventure"
      },
      {
        "id": 16,
        "name": "Animation"
      },
      {
        "id": 35,
        "name": "Comedy"
      },
      {
        "id": 80,
        "name": "Crime"
      },
      {
        "id": 99,
        "name": "Documentary"
      },
      {
        "id": 18,
        "name": "Drama"
      },
      {
        "id": 10751,
        "name": "Family"
      },
      {
        "id": 14,
        "name": "Fantasy"
      },
      {
        "id": 36,
        "name": "History"
      },
      {
        "id": 27,
        "name": "Horror"
      },
      {
        "id": 10402,
        "name": "Music"
      },
      {
        "id": 9648,
        "name": "Mystery"
      },
      {
        "id": 10749,
        "name": "Romance"
      },
      {
        "id": 878,
        "name": "Science Fiction"
      },
      {
        "id": 10770,
        "name": "TV Movie"
      },
      {
        "id": 53,
        "name": "Thriller"
      },
      {
        "id": 10752,
        "name": "War"
      },
      {
        "id": 37,
        "name": "Western"
      }
];