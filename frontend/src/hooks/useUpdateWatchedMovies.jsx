import React, { useState, useContext } from "react";
import { updateDoc, doc, arrayUnion, arrayRemove } from "./firebase/firestore";
import { db } from "./firebase/FirebaseConfig";
import { AuthContext } from "./contexts/userContext";
import toast, { Toaster } from "react-hot-toast";

function useUpdateWatchedMovies() {
  const { User } = useContext(AuthContext);
  const [Error, setError] = useState(false);

  function notify(message) {
    toast.success("Sucessfully removed item from Watched List");
  }

  function alertError(message) {
    toast.error(message);
  }

  const addToWatchedMovies = (movie) => {
    updateDoc(doc(db, "WatchedMovies", User.uid), {
      movies: arrayUnion(movie),
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
