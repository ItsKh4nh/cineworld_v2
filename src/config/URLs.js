import { API_KEY } from "./constants";

// Base endpoints
export const Trending = `trending/movie/week?api_key=${API_KEY}&language=en-US`;
export const TopRated = `movie/top_rated?api_key=${API_KEY}&language=en-US`;
export const NowPlaying = `movie/now_playing?api_key=${API_KEY}&language=en-US`;

// Keep the original string template for backward compatibility
export const GenreList = `discover/movie?api_key=${API_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=1000&with_genres={genre_id}`;
export const PeopleList = `discover/movie?api_key=${API_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=1000&with_people={people_id}`;

// Add function versions with different names
export const getGenreList = (genreId) =>
  `discover/movie?api_key=${API_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=1000&with_genres=${genreId}`;
export const getPeopleList = (peopleId) =>
  `discover/movie?api_key=${API_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=1000&with_people=${peopleId}`;

// Search endpoints
export const searchMovie = (query) =>
  `search/movie?api_key=${API_KEY}&language=en-US&query=${query}&page=1&include_adult=false`;
export const searchPerson = (query) =>
  `search/person?api_key=${API_KEY}&language=en-US&query=${query}&page=1&include_adult=false`;

// Movie details endpoints
export const movieDetails = (movie_id) =>
  `movie/${movie_id}?api_key=${API_KEY}&language=en-US&append_to_response=credits,images,watch/providers`;
export const movieVideos = (movie_id) =>
  `movie/${movie_id}/videos?api_key=${API_KEY}&language=en-US`;
export const movieRecommendations = (movie_id) =>
  `movie/${movie_id}/recommendations?api_key=${API_KEY}&language=en-US&page=1`;
export const movieRecommendationsWithPage = (movie_id, page = 1) =>
  `movie/${movie_id}/recommendations?api_key=${API_KEY}&language=en-US&page=${page}`;
export const collectionDetails = (collectionId) =>
  `collection/${collectionId}?api_key=${API_KEY}&language=en-US`;

// New endpoints for additional movie information
export const movieExternalIds = (movie_id) =>
  `movie/${movie_id}/external_ids?api_key=${API_KEY}`;
export const movieKeywords = (movie_id) =>
  `movie/${movie_id}/keywords?api_key=${API_KEY}`;
export const movieReviews = (movie_id) =>
  `movie/${movie_id}/reviews?api_key=${API_KEY}&language=en-US&page=1`;
export const configurationLanguages =
  `configuration/languages?api_key=${API_KEY}`;

// Person endpoints
export const personDetails = (personId) =>
  `person/${personId}?api_key=${API_KEY}&language=en-US&append_to_response=images`;
export const personMovieCredits = (personId) =>
  `person/${personId}/movie_credits?api_key=${API_KEY}&language=en-US`;
export const personTvCredits = (personId) =>
  `person/${personId}/tv_credits?api_key=${API_KEY}&language=en-US`;
export const personExternalIds = (personId) =>
  `person/${personId}/external_ids?api_key=${API_KEY}`;
export const personTaggedImages = (personId) =>
  `person/${personId}/tagged_images?api_key=${API_KEY}&language=en-US`;

// Discovery endpoints
export const discoverByPeople = (peopleIds) =>
  `discover/movie?api_key=${API_KEY}&language=en-US&sort_by=vote_average.desc&include_adult=false&include_video=false&page=1&with_people=${peopleIds}&vote_count.gte=100`;