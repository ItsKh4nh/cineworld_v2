import { API_KEY } from "./constants";

// export const Recommendations = '';
export const Trending = `trending/movie/week?api_key=${API_KEY}&language=en-US`;
// export const GenreList = `discover/movie?api_key=${API_KEY}&with_genres={genre_id}`;
export const Popular = `movie/popular?api_key=${API_KEY}&language=en-US`;
export const TopRated = `movie/top_rated?api_key=${API_KEY}&language=en-US`;
export const NowPlaying = `movie/now_playing?api_key=${API_KEY}&language=en-US`;