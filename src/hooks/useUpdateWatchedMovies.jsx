import React, { useContext, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { updateDoc, doc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import { AuthContext } from "../contexts/UserContext";

function useUpdateWatchedMovies() {
  const { User } = useContext(AuthContext);
  const [Error, setError] = useState(false);

  function notify() {
    toast.success("  Movie removed from Watched List  ");
  }
  function alertError(message) {
    toast.error(message);
  }
  const addToWatchedMovies = (movie) => {
    // Add dateAdded property if it doesn't exist
    const movieWithDate = {
      ...movie,
      dateAdded: movie.dateAdded || new Date().toISOString()
    };
    
    updateDoc(doc(db, "WatchedMovies", User.uid), {
      movies: arrayUnion(movieWithDate),
    });
  };

  const removeFromWatchedMovies = (movie) => {
    updateDoc(doc(db, "WatchedMovies", User.uid), {
      movies: arrayRemove(movie),
    })
      .then(() => {
        notify();
      })
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
        alertError(error.message);
        setError(true);
      });
  };

  const removePopupMessage = (
    <Toaster
      toastOptions={{
        style: {
          padding: "1.5rem",
          backgroundColor: Error ? "#fff4f4" : "#f4fff4",
          borderLeft: Error ? "6px solid red" : "6px solid lightgreen",
        },
      }}
    />
  );

  return { addToWatchedMovies, removeFromWatchedMovies, removePopupMessage };
}

export default useUpdateWatchedMovies;
