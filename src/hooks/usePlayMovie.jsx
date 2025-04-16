import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import { AuthContext } from "../contexts/UserContext";

/**
 * Custom hook for playing movies and tracking user interactions
 * Handles navigation to movie player and records user activity
 */
function usePlayMovie() {
  const navigate = useNavigate();
  const { User } = useContext(AuthContext);

  /**
   * Records that a user has interacted with a movie
   * Updates the user's interaction history in Firestore
   *
   * @param {number|string} movie_id - ID of the movie being watched
   * @returns {Promise<boolean>} Success status of the operation
   */
  const trackMovieInteraction = async (movie_id) => {
    try {
      if (!User || !User.uid) return false;

      // Ensure consistent type for movie_id (number)
      const movie_id_number =
        typeof movie_id === "string" ? parseInt(movie_id) : movie_id;

      const interactionDocRef = doc(db, "InteractionList", User.uid);
      const docSnap = await getDoc(interactionDocRef);

      if (docSnap.exists()) {
        // Update existing document if needed
        const userData = docSnap.data();
        const movieIds = userData.movie_ids || [];

        // Only add if not already in the list to avoid duplicates
        if (!movieIds.includes(movie_id_number)) {
          await updateDoc(interactionDocRef, {
            movie_ids: arrayUnion(movie_id_number),
            lastUpdated: new Date().toISOString(),
          });
        }
      } else {
        // Create new document for first interaction
        await setDoc(interactionDocRef, {
          movie_ids: [movie_id_number],
          lastUpdated: new Date().toISOString(),
        });
      }

      return true;
    } catch (error) {
      console.error("Error tracking movie interaction:", error);
      return false;
    }
  };

  /**
   * Navigates to the movie player page and tracks the interaction
   *
   * @param {Object} movie - Movie object containing at least an id
   * @param {string} from - Navigation source information
   */
  const playMovie = (movie, from) => {
    // Use non-blocking approach for interaction tracking
    if (movie?.id) {
      setTimeout(() => {
        trackMovieInteraction(movie.id);
      }, 0);
    }

    // Navigate to the player page
    navigate(`/play/${movie.id}`, { replace: true, state: { From: from } });
  };

  return { playMovie };
}

export default usePlayMovie;
