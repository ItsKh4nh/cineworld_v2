import axios from "../axios";
import { db } from "../firebase/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { movieRecommendationsWithPage } from "../config/URLs";

/**
 * Gets personalized movie recommendations for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of recommended movies
 */
export const getPersonalizedRecommendations = async (userId) => {
  try {
    // Check if user has fewer than 20 movies in their InteractionList
    const interactionListRef = doc(db, "InteractionList", userId);
    const interactionDoc = await getDoc(interactionListRef);
    
    if (!interactionDoc.exists()) {
      console.log("User has no interaction list");
      return [];
    }
    
    const interactionData = interactionDoc.data();
    const movieIds = interactionData.movie_ids || [];
    
    // If user has 20 or more movies in InteractionList, return empty array for now
    if (movieIds.length >= 20) {
      console.log("User has 20+ movies in interaction list - using future recommendation algorithm");
      return [];
    }
    
    // Check if user has movies in MyList
    const myListRef = doc(db, "MyList", userId);
    const myListDoc = await getDoc(myListRef);
    
    let sourceMovies = [];
    
    if (myListDoc.exists()) {
      const myListData = myListDoc.data();
      const myListMovies = myListData.movies || [];
      
      if (myListMovies.length > 0) {
        // User has movies in MyList
        // Sort by rating (highest first) and take top 5
        const sortedMovies = [...myListMovies].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        sourceMovies = sortedMovies.slice(0, 5);
      }
    }
    
    // If no movies in MyList, use random movies from InteractionList
    if (sourceMovies.length === 0 && movieIds.length > 0) {
      // Shuffle the movie IDs and take up to 5
      const shuffledIds = [...movieIds].sort(() => 0.5 - Math.random());
      sourceMovies = shuffledIds.slice(0, Math.min(5, movieIds.length)).map(id => ({ id }));
    }
    
    // No source movies found
    if (sourceMovies.length === 0) {
      return [];
    }
    
    // Get recommendations for each source movie
    const recommendationsPromises = sourceMovies.map(async (movie) => {
      try {
        const response = await axios.get(movieRecommendationsWithPage(movie.id));
        return response.data.results || [];
      } catch (error) {
        console.error(`Error fetching recommendations for movie ${movie.id}:`, error);
        return [];
      }
    });
    
    // Wait for all recommendations to finish
    const recommendationsArrays = await Promise.all(recommendationsPromises);
    
    // Flatten all recommendations into a single array
    let allRecommendations = recommendationsArrays.flat();
    
    // Remove duplicates based on movie ID
    const uniqueRecommendations = [];
    const uniqueIds = new Set();
    
    for (const movie of allRecommendations) {
      if (!uniqueIds.has(movie.id)) {
        uniqueIds.add(movie.id);
        uniqueRecommendations.push(movie);
      }
    }
    
    // Shuffle the recommendations
    const shuffledRecommendations = uniqueRecommendations.sort(() => 0.5 - Math.random());
    
    // Return up to 20 recommendations
    return shuffledRecommendations.slice(0, 20);
  } catch (error) {
    console.error("Error getting personalized recommendations:", error);
    return [];
  }
}; 