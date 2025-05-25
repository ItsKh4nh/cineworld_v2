import axios from "../axios";
import { db } from "../firebase/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { movieRecommendationsWithPage, movieDetails } from "../config/URLs";

/**
 * Gets personalized movie recommendations for a user based on their interactions
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of recommended movies
 */
export const getPersonalizedRecommendations = async (userId) => {
  try {
    const interactionData = await getUserInteractions(userId);
    if (!interactionData) {
      return [];
    }

    const movieIds = interactionData.movie_ids || [];

    // Deep Learning based recommendations for users with sufficient interaction history
    if (movieIds.length >= 20) {
      const aiRecommendations = await getAIRecommendations(userId);
      if (aiRecommendations.length > 0) {
        return aiRecommendations;
      }
      // Fall back to content-based recommendations if AI recommendations fail
    }

    // Content-based recommendations for users with limited interaction history
    return await getContentBasedRecommendations(userId, movieIds);
  } catch (error) {
    console.error("Error getting personalized recommendations:", error);
    return [];
  }
};

/**
 * Fetches a user's interaction data from Firestore
 * @param {string} userId - User ID
 * @returns {Object|null} User's interaction data or null if not found
 */
async function getUserInteractions(userId) {
  const interactionListRef = doc(db, "InteractionList", userId);
  const interactionDoc = await getDoc(interactionListRef);

  if (!interactionDoc.exists()) {
    console.log("User has no interaction list");
    return null;
  }

  return interactionDoc.data();
}

/**
 * Gets the user's numeric ID from the Users collection in Firestore
 * @param {string} userId - Firebase user ID
 * @returns {Promise<number|null>} User's numeric ID or null if not found
 */
async function getNumericUserId(userId) {
  try {
    const userRef = doc(db, "Users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.log("User not found in Users collection");
      return null;
    }

    return userDoc.data().user_id;
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return null;
  }
}

/**
 * Attempts to get AI-powered recommendations from external recommendation API
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of recommended movies from AI service
 */
async function getAIRecommendations(userId) {
  try {
    console.log("User has 20+ movies - using recommendation API");

    // Get user's numeric ID from Users collection
    const numericUserId = await getNumericUserId(userId);
    
    if (!numericUserId) {
      console.log("No numeric user ID found, cannot use AI recommendations");
      return [];
    }

    const recommendationsCount = 10;

    // Fetch recommendations from ML-based API using actual user ID
    const response = await axios.get(
      `https://api-cineworld.onrender.com//recommendations?user_id=${numericUserId}&top_k=${recommendationsCount}`
    );

    const recommendationsFromAPI = response.data.recommendations;

    // Enrich recommendation data with full movie details
    const detailedRecommendations = await Promise.all(
      recommendationsFromAPI.map(async (rec) => {
        try {
          const movieResponse = await axios.get(movieDetails(rec.movie_id));
          return {
            id: rec.movie_id,
            title: movieResponse.data.title,
            poster_path: movieResponse.data.poster_path,
            backdrop_path: movieResponse.data.backdrop_path,
            overview: movieResponse.data.overview,
            release_date: movieResponse.data.release_date,
            vote_average: movieResponse.data.vote_average,
            genre_ids: movieResponse.data.genres.map((genre) => genre.id),
            recommendation_score: rec.score,
          };
        } catch (error) {
          console.error(
            `Error fetching details for movie ${rec.movie_id}:`,
            error
          );
          return null;
        }
      })
    );

    return detailedRecommendations.filter((movie) => movie !== null);
  } catch (error) {
    console.error("Error calling recommendation API:", error);
    return [];
  }
}

/**
 * Generates content-based recommendations using user's liked movies
 * @param {string} userId - User ID
 * @param {Array} interactionMovieIds - IDs of movies the user has interacted with
 * @returns {Promise<Array>} Array of recommended movies
 */
async function getContentBasedRecommendations(userId, interactionMovieIds) {
  // First try to use highly-rated movies from user's MyList
  const sourceMovies = await getRecommendationSeedMovies(
    userId,
    interactionMovieIds
  );

  if (sourceMovies.length === 0) {
    return [];
  }

  // Get similar movies for each source movie
  const recommendationsPromises = sourceMovies.map(async (movie) => {
    try {
      const response = await axios.get(movieRecommendationsWithPage(movie.id));
      return response.data.results || [];
    } catch (error) {
      console.error(
        `Error fetching recommendations for movie ${movie.id}:`,
        error
      );
      return [];
    }
  });

  const recommendationsArrays = await Promise.all(recommendationsPromises);
  const allRecommendations = recommendationsArrays.flat();

  // Filter out movies the user has already interacted with
  const interactionMovieIdsSet = new Set(interactionMovieIds);
  const newRecommendations = allRecommendations.filter(
    (movie) => !interactionMovieIdsSet.has(movie.id)
  );

  // Remove duplicates and shuffle for variety
  return getUniqueRandomizedRecommendations(newRecommendations, 10);
}

/**
 * Identifies the best movies to use as seeds for recommendations
 * Prefers highly-rated movies from MyList, falls back to random interactions
 * @param {string} userId - User ID
 * @param {Array} interactionMovieIds - Movie IDs from user's interaction history
 * @returns {Promise<Array>} Array of seed movies to base recommendations on
 */
async function getRecommendationSeedMovies(userId, interactionMovieIds) {
  const myListRef = doc(db, "MyList", userId);
  const myListDoc = await getDoc(myListRef);

  let sourceMovies = [];

  if (myListDoc.exists()) {
    const myListData = myListDoc.data();
    const myListMovies = myListData.movies || [];

    if (myListMovies.length > 0) {
      // Prioritize highly-rated movies for better recommendations
      const sortedMovies = [...myListMovies].sort(
        (a, b) => (b.rating || 0) - (a.rating || 0)
      );
      sourceMovies = sortedMovies.slice(0, 5);
    }
  }

  // Fall back to random movies from interaction history if no rated movies exist
  if (sourceMovies.length === 0 && interactionMovieIds.length > 0) {
    const shuffledIds = [...interactionMovieIds].sort(
      () => 0.5 - Math.random()
    );
    sourceMovies = shuffledIds
      .slice(0, Math.min(5, interactionMovieIds.length))
      .map((id) => ({ id }));
  }

  return sourceMovies;
}

/**
 * Filters out duplicate movies and randomizes the order
 * @param {Array} recommendations - Array of movie recommendations
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Array} Unique, randomized recommendations limited to specified count
 */
function getUniqueRandomizedRecommendations(recommendations, limit) {
  const uniqueRecommendations = [];
  const uniqueIds = new Set();

  for (const movie of recommendations) {
    if (!uniqueIds.has(movie.id)) {
      uniqueIds.add(movie.id);
      uniqueRecommendations.push(movie);
    }
  }

  // Randomize recommendations for variety
  const shuffledRecommendations = uniqueRecommendations.sort(
    () => 0.5 - Math.random()
  );
  return shuffledRecommendations.slice(0, limit);
}
