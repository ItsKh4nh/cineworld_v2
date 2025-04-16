import { useState, useEffect, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import { AuthContext } from "../contexts/UserContext";

/**
 * Custom hook that determines if a user has any movie interactions
 *
 * @returns {Object} An object containing:
 *   - hasInteractions: Whether the user has any movies in their interaction list
 *   - loading: Whether the interaction check is in progress
 */
export default function useHasInteractions() {
  const [hasInteractions, setHasInteractions] = useState(false);
  const [loading, setLoading] = useState(true);
  const { User } = useContext(AuthContext);

  useEffect(() => {
    const checkUserInteractions = async () => {
      // Handle unauthenticated state
      if (!User) {
        setHasInteractions(false);
        setLoading(false);
        return;
      }

      try {
        // Query user's interaction list from Firestore
        const interactionListRef = doc(db, "InteractionList", User.uid);
        const interactionDoc = await getDoc(interactionListRef);

        if (interactionDoc.exists()) {
          const interactionData = interactionDoc.data();
          // User has interactions if movie_ids array exists and has content
          const hasMovies =
            interactionData.movie_ids && interactionData.movie_ids.length > 0;
          setHasInteractions(hasMovies);
        } else {
          setHasInteractions(false);
        }
      } catch (error) {
        console.error("Error checking user interactions:", error);
        setHasInteractions(false);
      }

      setLoading(false);
    };

    checkUserInteractions();
  }, [User]); // Re-run effect when user changes

  return { hasInteractions, loading };
}
