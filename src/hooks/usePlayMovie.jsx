import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import { AuthContext } from "../contexts/UserContext";

function usePlayMovie() {
  const navigate = useNavigate();
  const { User } = useContext(AuthContext);

  // Track interaction directly (no circular dependency)
  const trackMovieInteraction = async (movie_id) => {
    try {
      if (!User || !User.uid) return false;

      const movie_id_number = typeof movie_id === 'string' ? parseInt(movie_id) : movie_id;
      
      // Reference to the user's interaction list document
      const interactionDocRef = doc(db, "InteractionList", User.uid);
      const docSnap = await getDoc(interactionDocRef);
      
      if (docSnap.exists()) {
        // Document exists, check if movie_id is already in the list
        const userData = docSnap.data();
        const movieIds = userData.movie_ids || [];
        
        // Only add if not already in the list
        if (!movieIds.includes(movie_id_number)) {
          await updateDoc(interactionDocRef, {
            movie_ids: arrayUnion(movie_id_number),
            lastUpdated: new Date().toISOString()
          });
        }
      } else {
        // Document doesn't exist, create it
        await setDoc(interactionDocRef, {
          movie_ids: [movie_id_number],
          lastUpdated: new Date().toISOString()
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error tracking movie interaction:", error);
      return false;
    }
  };

  const playMovie = (movie, from) => {
    // Track interaction when user navigates to watch a movie
    // Use non-blocking approach for interaction tracking
    if (movie?.id) {
      setTimeout(() => {
        trackMovieInteraction(movie.id);
      }, 0);
    }
    navigate(`/play/${movie.id}`, { replace: true, state: { From: from } });
  };

  return { playMovie };
}

export default usePlayMovie;
