import { useState, useContext, useEffect } from "react";
import { PopUpContext } from "../contexts/MoviePopUpContext";
import { AuthContext } from "../contexts/UserContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import axios from "../axios";
import { movieVideos } from "../config/URLs";

/**
 * Custom hook for managing movie popup functionality
 * Provides methods for displaying movie details and managing trailer playback
 */
function useMoviePopup() {
  const { setShowModal, setMovieInfo, setTrailerUrl } =
    useContext(PopUpContext);
  const { User } = useContext(AuthContext);
  const [myListMovies, setMyListMovies] = useState([]);

  // Subscribe to user's MyList with real-time updates
  useEffect(() => {
    if (!User) return;

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
  }, [User]);

  /**
   * Displays the movie popup with information and trailer
   * @param {Object} movieInfo - Movie data to display in the popup
   */
  const handleMoviePopup = (movieInfo) => {
    // Enrich movie info with MyList status
    const isInMyList = myListMovies.some((movie) => movie.id === movieInfo.id);
    const enrichedMovieInfo = {
      ...movieInfo,
      isInMyList,
    };

    // Update context state with small delay to ensure DOM updates properly
    setTimeout(() => {
      setMovieInfo(enrichedMovieInfo);
      setShowModal(true);

      // Fetch and set trailer if available
      fetchTrailer(movieInfo.id);
    }, 10);
  };

  /**
   * Fetches movie trailer from API
   * @param {number} movieId - ID of the movie to fetch trailer for
   */
  const fetchTrailer = (movieId) => {
    axios
      .get(movieVideos(movieId))
      .then((response) => {
        if (response.data.results.length !== 0) {
          const trailerVideo =
            response.data.results.find((video) => video.type === "Trailer") ||
            response.data.results[0];

          setTrailerUrl(trailerVideo.key);
        } else {
          setTrailerUrl("");
        }
      })
      .catch((error) => {
        console.error("Error fetching trailer:", error);
        setTrailerUrl("");
      });
  };

  /**
   * Formats a date string to a more readable format
   * @param {string} dateString - Date string to format (YYYY-MM-DD)
   * @returns {string} Formatted date (Month Day, Year)
   */
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
    myListMovies,
  };
}

export default useMoviePopup;
