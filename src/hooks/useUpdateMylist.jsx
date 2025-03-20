import React, { useContext } from "react";
import { updateDoc, doc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import { AuthContext } from "../contexts/UserContext";
import { RatingModalContext } from "../contexts/RatingModalContext";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function useUpdateMyList() {
  const { User, isGuestMode } = useContext(AuthContext);
  const ratingModalContext = useContext(RatingModalContext) || {};
  const { openRatingModal } = ratingModalContext;
  const navigate = useNavigate();

  function notify() {
    toast.success("  Movie added to MyList  ");
  }
  
  function alertError(message) {
    toast.error(message);
  }

  const showSignInPrompt = () => {
    toast.error("Please sign in to add movies to your list", {
      duration: 3000,
      onClick: () => navigate("/signin")
    });
  };

  const addToMyList = (movie) => {
    console.log("addToMyList called with:", movie);
    
    // If not authenticated, show sign in prompt
    if (!User) {
      showSignInPrompt();
      return;
    }
    
    if (openRatingModal) {
      openRatingModal(movie, User);
    } else {
      console.error("openRatingModal is not available");
      alertError("Rating feature is not available right now");
    }
  };

  const addRatedMovieToList = async (ratedMovie) => {
    try {
      // Check if the movie already exists in the list
      const userDocRef = doc(db, "MyList", User.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const movies = userData.movies || [];
        const existingMovie = movies.find(m => m.id === ratedMovie.id);
        
        if (existingMovie) {
          // Movie exists, update it instead of adding a duplicate
          // First remove the existing movie
          const filteredMovies = movies.filter(m => m.id !== ratedMovie.id);
          
          // Then add the updated movie
          filteredMovies.push(ratedMovie);
          
          // Update the document with the new array
          await updateDoc(userDocRef, { movies: filteredMovies });
          console.log("Movie rating updated successfully");
          notify();
        } else {
          // Movie doesn't exist, add it to the list
          await updateDoc(userDocRef, { movies: arrayUnion(ratedMovie) });
          console.log("Rated movie added to MyList");
          notify();
        }
      } else {
        // Document doesn't exist, create it with the movie
        await updateDoc(userDocRef, { movies: arrayUnion(ratedMovie) });
        console.log("Rated movie added to MyList");
        notify();
      }
    } catch (error) {
      console.log(error.code);
      console.log(error.message);
      alertError(error.message);
    }
  };

  // Check if a movie is in the user's list
  const checkIfInMyList = async (movieId) => {
    try {
      if (!User || !User.uid) return false;
      
      const userDocRef = doc(db, "MyList", User.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const movies = userData.movies || [];
        return movies.some(movie => movie.id === parseInt(movieId) || movie.id === movieId);
      }
      return false;
    } catch (error) {
      console.error("Error checking if movie is in list:", error);
      return false;
    }
  };

  // New function to properly update a movie's rating
  const updateRatedMovie = async (oldMovie, updatedMovie) => {
    try {
      // Get the current list
      const userDocRef = doc(db, "MyList", User.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const currentMovies = userData.movies || [];
        
        // Remove the old movie
        const filteredMovies = currentMovies.filter(movie => movie.id !== oldMovie.id);
        
        // Add the updated movie
        filteredMovies.push(updatedMovie);
        
        // Update the document with the new array
        await updateDoc(userDocRef, { movies: filteredMovies });
        
        console.log("Movie rating updated successfully");
        toast.success("Rating updated successfully!");
        return true;
      } else {
        console.log("No such document!");
        alertError("Failed to update rating");
        return false;
      }
    } catch (error) {
      console.error("Error updating movie rating:", error);
      alertError("Failed to update rating: " + error.message);
      return false;
    }
  };

  const removeFromMyList = async (movie) => {
    try {
      // Get the current list
      const userDocRef = doc(db, "MyList", User.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const currentMovies = userData.movies || [];
        
        // Filter out the movie to remove by ID
        const filteredMovies = currentMovies.filter(m => m.id !== movie.id);
        
        // Update the document with the filtered list
        await updateDoc(userDocRef, { movies: filteredMovies });
        
        console.log("Movie removed from MyList successfully");
        toast.success(" Movie removed from MyList  ");
        return true;
      } else {
        console.log("No such document!");
        return false;
      }
    } catch (error) {
      console.log(error.code);
      console.log(error.message);
      alertError(error.message);
      return false;
    }
  };

  const updateMovieNote = async (movie, newNote) => {
    try {
      // Get the current list
      const userDocRef = doc(db, "MyList", User.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const currentMovies = userData.movies || [];
        
        // Remove the old movie
        const filteredMovies = currentMovies.filter(m => m.id !== movie.id);
        
        // Create updated movie with new note
        const updatedMovie = {
          ...movie,
          userRating: {
            ...movie.userRating,
            note: newNote
          }
        };
        
        // Add the updated movie
        filteredMovies.push(updatedMovie);
        
        // Update the document with the new array
        await updateDoc(userDocRef, { movies: filteredMovies });
        
        console.log("Movie note updated successfully");
        toast.success("Note updated successfully");
        return true;
      } else {
        console.log("No such document!");
        alertError("Failed to update note");
        return false;
      }
    } catch (error) {
      console.error("Error updating movie note:", error);
      alertError("Failed to update note: " + error.message);
      return false;
    }
  };

  const PopupMessage = (
    <Toaster
      toastOptions={{
        style: {
          padding: "1.5rem",
          backgroundColor: "#f4fff4",
          borderLeft: "6px solid lightgreen",
        },
      }}
    />
  );

  return { 
    addToMyList, 
    addRatedMovieToList,
    updateRatedMovie,
    removeFromMyList, 
    updateMovieNote,
    checkIfInMyList,
    PopupMessage
  };
}

export default useUpdateMyList;
