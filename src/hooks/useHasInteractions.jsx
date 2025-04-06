import { useEffect, useState, useContext } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/FirebaseConfig';
import { AuthContext } from '../contexts/UserContext';

/**
 * Hook to check if user has any movies in their InteractionList
 * @returns {boolean} hasInteractions - Whether user has interactions or not
 * @returns {boolean} loading - Whether the data is still loading
 */
const useHasInteractions = () => {
  const [hasInteractions, setHasInteractions] = useState(false);
  const [loading, setLoading] = useState(true);
  const { User } = useContext(AuthContext);

  useEffect(() => {
    const checkInteractions = async () => {
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
          const movieIds = interactionData.movie_ids || [];
          
          setHasInteractions(movieIds.length > 0);
        } else {
          setHasInteractions(false);
        }
      } catch (error) {
        console.error("Error checking interactions:", error);
        setHasInteractions(false);
      } finally {
        setLoading(false);
      }
    };

    checkInteractions();
  }, [User]);

  return { hasInteractions, loading };
};

export default useHasInteractions; 