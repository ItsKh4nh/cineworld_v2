import { useContext } from "react";
import { updateDoc, doc, arrayUnion, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import { AuthContext } from "../contexts/UserContext";
import { RatingModalContext } from "../contexts/RatingModalContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

/**
 * Custom hook for managing operations related to user's movie list
 * Provides functions to add, remove, check, and update movies in user's list
 */
function useUpdateMyList() {
  const { User } = useContext(AuthContext);
  const { openRatingModal } = useContext(RatingModalContext) || {};
  const navigate = useNavigate();

  /**
   * Records a movie interaction in user's history
   * @param {number|string} movie_id - ID of the movie to track
   * @returns {Promise<boolean>} Success status
   */
  const trackMovieInteraction = async (movie_id) => {
    try {
      if (!User || !User.uid) return false;

      const movie_id_number =
        typeof movie_id === "string" ? parseInt(movie_id) : movie_id;
      const interactionDocRef = doc(db, "InteractionList", User.uid);
      const docSnap = await getDoc(interactionDocRef);

      if (docSnap.exists()) {
        // Add to existing list if not already present
        const userData = docSnap.data();
        const movieIds = userData.movie_ids || [];

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
   * Shows login prompt for unauthenticated users
   */
  const showSignInPrompt = () => {
    toast.error("Please login to add movies to your list", {
      duration: 3000,
      onClick: () => navigate("/signin"),
    });
  };

  /**
   * Initiates adding a movie to user's list with rating
   * Opens rating modal to collect user rating before adding
   *
   * @param {Object} movie - Movie object to be added
   * @returns {Promise<boolean>} Promise that resolves when operation completes
   */
  const addToMyList = (movie) => {
    // Require authentication
    if (!User) {
      showSignInPrompt();
      return Promise.resolve(false);
    }

    if (openRatingModal) {
      return new Promise((resolve) => {
        const originalMovie = movie;

        // Set up listener to capture rating modal result
        const handleModalResult = (event) => {
          if (event.detail && event.detail.movieId === originalMovie.id) {
            window.removeEventListener("ratingModalClosed", handleModalResult);
            resolve(event.detail.success);
          }
        };

        window.addEventListener("ratingModalClosed", handleModalResult);
        openRatingModal(movie, User);

        // Safety timeout to prevent promise from hanging
        setTimeout(() => {
          window.removeEventListener("ratingModalClosed", handleModalResult);
          resolve(false);
        }, 30000);
      });
    } else {
      toast.error("Rating feature is not available right now");
      return Promise.resolve(false);
    }
  };

  /**
   * Adds a rated movie to user's MyList
   * Called after user submits rating from modal
   *
   * @param {Object} ratedMovie - Movie with rating information
   * @returns {Promise<boolean>} Success status
   */
  const addRatedMovieToList = async (ratedMovie) => {
    try {
      if (!User) return false;

      // Prepare movie data with consistent genre format
      let movieToSave = { ...ratedMovie };

      // Convert genres array to genre_ids if needed
      if (
        movieToSave.genres &&
        Array.isArray(movieToSave.genres) &&
        !movieToSave.genre_ids
      ) {
        movieToSave.genre_ids = movieToSave.genres.map((genre) => genre.id);
      }

      const userDocRef = doc(db, "MyList", User.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const movies = userData.movies || [];
        const existingMovie = movies.find((m) => m.id === movieToSave.id);

        if (existingMovie) {
          // Update existing movie instead of adding duplicate
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
          const updatedMovies = [
            ...movies,
            { ...movieToSave, isInMyList: true },
          ];
          await updateDoc(userDocRef, { movies: updatedMovies });
          toast.success("Movie added to MyList");
        }
      } else {
        // Create new document with movie
        await setDoc(userDocRef, {
          movies: [{ ...movieToSave, isInMyList: true }],
          lastUpdated: new Date().toISOString(),
        });
        toast.success("Movie added to MyList");
      }

      // Track interaction for recommendation system
      trackMovieInteraction(movieToSave.id);
      return true;
    } catch (error) {
      console.error("Error adding rated movie:", error);
      toast.error(error.message);
      return false;
    }
  };

  /**
   * Checks if a movie is in user's list
   * @param {number|string} movie_id - ID of movie to check
   * @returns {Promise<boolean>} True if movie is in user's list
   */
  const checkIfInMyList = async (movie_id) => {
    try {
      if (!User || !User.uid) return false;

      const userDocRef = doc(db, "MyList", User.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const movies = userData.movies || [];
        return movies.some(
          (movie) => movie.id === parseInt(movie_id) || movie.id === movie_id
        );
      }
      return false;
    } catch (error) {
      console.error("Error checking if movie is in list:", error);
      return false;
    }
  };

  /**
   * Updates a movie's rating in user's list
   * @param {Object} oldMovie - Original movie object
   * @param {Object} updatedMovie - Movie with updated rating
   * @returns {Promise<boolean>} Success status
   */
  const updateRatedMovie = async (oldMovie, updatedMovie) => {
    try {
      if (!User) return false;

      const userDocRef = doc(db, "MyList", User.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const currentMovies = userData.movies || [];

        // Replace movie with updated version
        const filteredMovies = currentMovies.filter(
          (movie) => movie.id !== oldMovie.id
        );
        filteredMovies.push(updatedMovie);

        await updateDoc(userDocRef, {
          movies: filteredMovies,
          lastUpdated: new Date().toISOString(),
        });

        toast.success("Rating updated successfully!");
        return true;
      }

      toast.error("Failed to update rating");
      return false;
    } catch (error) {
      console.error("Error updating movie rating:", error);
      toast.error("Failed to update rating: " + error.message);
      return false;
    }
  };

  /**
   * Removes a movie from user's list
   * @param {Object} movie - Movie to remove
   * @returns {Promise<boolean>} Success status
   */
  const removeFromMyList = async (movie) => {
    try {
      if (!User) return false;

      const userDocRef = doc(db, "MyList", User.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const currentMovies = userData.movies || [];

        // Filter out the movie to remove
        const filteredMovies = currentMovies.filter((m) => m.id !== movie.id);

        await updateDoc(userDocRef, {
          movies: filteredMovies,
          lastUpdated: new Date().toISOString(),
        });

        toast.success("Movie removed from MyList");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error removing movie from list:", error);
      toast.error(error.message);
      return false;
    }
  };

  /**
   * Updates a movie's personal note in user's list
   * @param {Object} movie - Movie to update
   * @param {string} newNote - New note content
   * @returns {Promise<boolean>} Success status
   */
  const updateMovieNote = async (movie, newNote) => {
    try {
      if (!User) return false;

      const userDocRef = doc(db, "MyList", User.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const currentMovies = userData.movies || [];

        // Create updated movie with new note
        const updatedMovies = currentMovies.map((m) => {
          if (m.id === movie.id) {
            return {
              ...m,
              userRating: {
                ...m.userRating,
                note: newNote,
              },
            };
          }
          return m;
        });

        await updateDoc(userDocRef, {
          movies: updatedMovies,
          lastUpdated: new Date().toISOString(),
        });

        toast.success("Note updated successfully");
        return true;
      }

      toast.error("Failed to update note");
      return false;
    } catch (error) {
      console.error("Error updating movie note:", error);
      toast.error("Failed to update note: " + error.message);
      return false;
    }
  };

  return {
    addToMyList,
    addRatedMovieToList,
    updateRatedMovie,
    removeFromMyList,
    updateMovieNote,
    checkIfInMyList,
  };
}

export default useUpdateMyList;
