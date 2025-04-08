import { useState, useEffect, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import { AuthContext } from "../contexts/UserContext";

/**
 * Hook to check if a user has any movies in their interaction list
 * @returns {boolean} hasInteractions - Whether the user has any movies in their interaction list
 */
export default function useHasInteractions() {
  const [hasInteractions, setHasInteractions] = useState(false);
  const [loading, setLoading] = useState(true);
  const { User } = useContext(AuthContext);

  useEffect(() => {
    const checkUserInteractions = async () => {
      if (!User) {
        setHasInteractions(false);
        setLoading(false);
        return;
      }

      try {
        const interactionListRef = doc(db, "InteractionList", User.uid);
        const interactionDoc = await getDoc(interactionListRef);

        if (interactionDoc.exists()) {
          const interactionData = interactionDoc.data();
          const hasMovies = interactionData.movie_ids && interactionData.movie_ids.length > 0;
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
  }, [User]);

  return { hasInteractions, loading };
} 