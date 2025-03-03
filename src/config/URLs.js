import { API_KEY } from "./constants";

export const originals = `discover/tv?api_key=${API_KEY}&with_networks=213&sort_by=popularity.desc&language=en-US`;
export const action = `discover/movie?api_key=${API_KEY}&with_genres=28`;
export const comedy = `discover/movie?api_key=${API_KEY}&with_genres=35`;
export const horror = `discover/movie?api_key=${API_KEY}&with_genres=27`;
export const Adventure = `discover/movie?api_key=${API_KEY}&with_genres=12`;
export const SciFi = `discover/movie?api_key=${API_KEY}&with_genres=878`;
export const Animated = `discover/movie?api_key=${API_KEY}&with_genres=16`;
export const War = `discover/movie?api_key=${API_KEY}&with_genres=10752`;

export const trending = `trending/all/week?api_key=${API_KEY}&sort_by=popularity.desc&language=en-US`;
export const trendingSeries = `/trending/tv/week?api_key=${API_KEY}&sort_by=popularity.desc&language=en-US`;

///Trending
export const TrendingAll = `trending/all/week?api_key=${API_KEY}&sort_by=popularity`; /////
export const TrendingMovies = `/trending/movie/week?api_key=${API_KEY}`;
export const TrendingTV = `/trending/tv/week?api_key=${API_KEY}`;
export const TrendingPeople = `/trending/person/week?api_key=${API_KEY}`;

// //Search
// export const CollectionSearch = `/search/collection?api_key=${API_KEY}&language=en-US&query=${query}&page=1&include_adult=false`;
// export const MovieSearch = `/search/movie?api_key=${API_KEY}&language=en-US&query=${query}&page=1&include_adult=false`;
// export const PersonSearch = `/search/person?api_key=${API_KEY}&language=en-US&query=${query}&page=1&include_adult=false`;
// export const MultiSearch = `/search/multi?api_key=${API_KEY}&language=en-US&query=${query}&page=1&include_adult=false`; ///

// //Movies
// export const NowPlayingMovies = `/movie/now_playing?api_key=${API_KEY}&language=en-US`;
// export const PopularMovies = `/movie/popular?api_key=${API_KEY}&language=en-US`;
// export const TopRatedMovies = `/movie/top_rated?api_key=${API_KEY}&language=en-US`;
export const UpcomingMovies = `/movie/upcoming?api_key=${API_KEY}&language=en-US`;
// export const GetMovieDetails = `/movie/${movie_id}?api_key=${API_KEY}&language=en-US`; /////
// export const GetMovieRecommendations = `/movie/${movie_id}/recommendations?api_key=${API_KEY}&language=en-US`;
// export const GetMovieSimilar = `/movie/${movie_id}/similar?api_key=${API_KEY}&language=en-US`;
// export const GetMovieReviews = `/movie/${movie_id}/reviews?api_key=${API_KEY}&language=en-US`;
// export const GetMovieVideos = `/movie/${movie_id}/videos?api_key=${API_KEY}&language=en-US`;
// export const GetMovieProviders = `/movie/${movie_id}/watch/providers?api_key=${API_KEY}&language=en-US`;

// //People
// export const PopularPeoples = `/person/popular?api_key=${API_KEY}&language=en-US`;
// export const GetPeopleDetails = `/person/${people_id}?api_key=${API_KEY}&language=en-US`; /////
// export const GetPeopleImages = `/person/${people_id}/images?api_key=${API_KEY}&language=en-US`;

// //Watch Providers
// export const AvailableRegions = `/watch/providers/regions?api_key=${API_KEY}`;
// export const MovieProvidersList = `/watch/providers/movie?api_key=${API_KEY}&language=en-US`;
