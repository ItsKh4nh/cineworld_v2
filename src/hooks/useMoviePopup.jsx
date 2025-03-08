import { useState, useContext, useEffect } from "react";
import { PopUpContext } from "../contexts/moviePopUpContext";
import { AuthContext } from "../contexts/UserContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import axios from "../axios";
import { API_KEY } from "../config/constants";

function useMoviePopup() {
  const { setShowModal, setMovieInfo, setTrailerUrl } = useContext(PopUpContext);
  const { User } = useContext(AuthContext);
  const [myListMovies, setMyListMovies] = useState([]);

  // Fetch user's MyList movies with real-time updates
  useEffect(() => {
    if (User) {
      // Set up a real-time listener for MyList changes
      const unsubscribe = onSnapshot(
        doc(db, "MyList", User.uid),
        (snapshot) => {
          if (snapshot.exists()) {
            const myList = snapshot.data();
            setMyListMovies(myList.movies || []);
          }
        },
        (error) => {
          console.error("Error fetching MyList:", error);
        }
      );

      // Clean up the listener when the component unmounts
      return () => unsubscribe();
    }
  }, [User]);

  const handleMoviePopup = (movieInfo) => {
    // Check if movie is in MyList
    const isInMyList = myListMovies.some(movie => movie.id === movieInfo.id);
    
    // Add isInMyList property to movieInfo
    const enrichedMovieInfo = {
      ...movieInfo,
      isInMyList
    };
    
    // Force a small delay to ensure DOM updates properly
    setTimeout(() => {
      // Update context state
      setMovieInfo(enrichedMovieInfo);
      setShowModal(true);
      
      // Fetch trailer videos if available
      axios
        .get(`/movie/${movieInfo.id}/videos?api_key=${API_KEY}&language=en-US`)
        .then((response) => {
          if (response.data.results.length !== 0) {
            const trailerVideo = response.data.results.find(
              (video) => video.type === "Trailer"
            ) || response.data.results[0];
            
            setTrailerUrl(trailerVideo.key);
          } else {
            setTrailerUrl("");
          }
        })
        .catch((error) => {
          console.error("Error fetching trailer:", error);
          setTrailerUrl("");
        });
    }, 10); // Small delay to ensure state updates are processed
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return { 
    handleMoviePopup, 
    formatDate,
    myListMovies
  };
}

export default useMoviePopup; 