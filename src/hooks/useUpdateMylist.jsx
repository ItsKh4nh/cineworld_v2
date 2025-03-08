import React, { useContext } from "react";
import { updateDoc, doc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import { AuthContext } from "../contexts/UserContext";
import { RatingModalContext } from "../contexts/RatingModalContext";
import toast, { Toaster } from "react-hot-toast";

function useUpdateMyList() {
  const { User } = useContext(AuthContext);
  const ratingModalContext = useContext(RatingModalContext) || {};
  const { openRatingModal } = ratingModalContext;

  function notify() {
    toast.success("  Movie added to MyList  ");
  }
  
  function alertError(message) {
    toast.error(message);
  }

  const addToMyList = (movie) => {
    console.log("addToMyList called with:", movie);
    if (openRatingModal) {
      openRatingModal(movie, User);
    } else {
      console.error("openRatingModal is not available");
      alertError("Rating feature is not available right now");
    }
  };

  const addRatedMovieToList = (ratedMovie) => {
    updateDoc(doc(db, "MyList", User.uid), { movies: arrayUnion(ratedMovie) })
      .then(() => {
        console.log("Rated movie added to MyList");
        notify();
      })
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
        alertError(error.message);
      });
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

  const removeFromMyList = (movie) => {
    updateDoc(doc(db, "MyList", User.uid), { movies: arrayRemove(movie) })
      .then(() => {
        toast.success(" Movie removed from MyList  ");
      })
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
      });
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
    PopupMessage
  };
}

export default useUpdateMyList;
