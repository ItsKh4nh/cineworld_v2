import React, { createContext, useState } from "react";
import RatingModal from "../components/Modals/RatingModal";
import { updateDoc, doc, arrayUnion, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

/**
 * Context for managing the movie rating modal across the application
 * Provides functionality for rating movies and adding them to user's list
 */
export const RatingModalContext = createContext();

export const RatingModalProvider = ({ children }) => {
  // State management
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [user, setUser] = useState(null);
  const [userMovies, setUserMovies] = useState([]);
  const navigate = useNavigate();

  /**
   * Closes the rating modal and resets related state
   */
  const closeRatingModal = () => {
    setShowModal(false);
    setSelectedMovie(null);
  };

  /**
   * Navigates to MyList page after closing the modal
   */
  const goToMyList = () => {
    closeRatingModal();
    navigate("/mylist");
  };

  /**
   * Opens the rating modal with the specified movie and user
   * Retrieves existing ratings if the movie is already in user's list
   */
  const openRatingModal = async (movie, currentUser) => {
    setSelectedMovie(movie);
    setUser(currentUser);

    if (currentUser) {
      try {
        const docRef = doc(db, "MyList", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserMovies(data.movies || []);

          // Pre-populate existing rating if movie is already rated
          const existingMovie = data.movies?.find((m) => m.id === movie.id);
          if (existingMovie) {
            setSelectedMovie({
              ...movie,
              userRating: existingMovie.userRating,
            });
          }
        }
      } catch (error) {
        console.error("Error checking for existing movie:", error);
      }
    }

    setShowModal(true);
  };

  /**
   * Records user interaction with a movie for personalized recommendations
   * @param {number|string} movie_id - ID of the movie the user interacted with
   * @returns {Promise<boolean>} Success status
   */
  const trackMovieInteraction = async (movie_id) => {
    try {
      if (!user || !user.uid) return false;

      // Ensure movie_id is a number for consistency
      const movie_id_number =
        typeof movie_id === "string" ? parseInt(movie_id) : movie_id;
      const interactionDocRef = doc(db, "InteractionList", user.uid);
      const docSnap = await getDoc(interactionDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const movieIds = userData.movie_ids || [];

        // Prevent duplicate entries
        if (!movieIds.includes(movie_id_number)) {
          await updateDoc(interactionDocRef, {
            movie_ids: arrayUnion(movie_id_number),
            lastUpdated: new Date().toISOString(),
          });
        }
      } else {
        // First interaction for this user
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
   * Adds or updates a rated movie in the user's list
   * @param {Object} ratedMovie - Movie with user's rating information
   * @returns {Promise<boolean>} Success status
   */
  const addRatedMovieToList = async (ratedMovie) => {
    if (!user) {
      toast.error("User not authenticated");
      return false;
    }

    try {
      // Prepare movie data with MyList flag
      let movieToSave = { ...ratedMovie, isInMyList: true };

      // Handle genre data format conversion for compatibility
      if (
        movieToSave.genres &&
        Array.isArray(movieToSave.genres) &&
        !movieToSave.genre_ids
      ) {
        movieToSave.genre_ids = movieToSave.genres.map((genre) => genre.id);
      }

      const userDocRef = doc(db, "MyList", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const movies = userData.movies || [];
        const existingMovie = movies.find((m) => m.id === movieToSave.id);

        if (existingMovie) {
          // Update existing movie entry
          const filteredMovies = movies.filter((m) => m.id !== movieToSave.id);
          filteredMovies.push({
            ...movieToSave,
            genre_ids: movieToSave.genre_ids || existingMovie.genre_ids,
            isInMyList: true,
          });

          await updateDoc(userDocRef, { movies: filteredMovies });
          toast.success("Rating updated successfully!");
        } else {
          // Add new movie to list
          const updatedMovies = [...movies, movieToSave];
          await updateDoc(userDocRef, { movies: updatedMovies });
          toast.success("Movie added to MyList");
        }
      } else {
        // Create first MyList entry for this user
        await setDoc(userDocRef, { movies: [movieToSave] });
        toast.success("Movie added to MyList");
      }

      // Record interaction for recommendation engine
      await trackMovieInteraction(movieToSave.id);

      closeRatingModal();
      return true;
    } catch (error) {
      console.error("Error saving movie rating:", error.message);
      toast.error(error.message);
      return false;
    }
  };

  return (
    <RatingModalContext.Provider
      value={{
        openRatingModal,
        closeRatingModal,
        goToMyList,
      }}
    >
      {children}
      {showModal && selectedMovie && (
        <RatingModal
          movie={selectedMovie}
          onClose={closeRatingModal}
          onSave={addRatedMovieToList}
          onGoToMyList={goToMyList}
        />
      )}
    </RatingModalContext.Provider>
  );
};
