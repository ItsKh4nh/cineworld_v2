import React, { useContext } from "react";
import { updateDoc, doc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import { AuthContext } from "../contexts/UserContext";
import { RatingModalContext } from "../contexts/RatingModalContext";
import toast, { Toaster } from "react-hot-toast";

function useUpdateMyList() {
  const { User } = useContext(AuthContext);
  const { openRatingModal } = useContext(RatingModalContext);

  function notify() {
    toast.success("  Movie added to MyList  ");
  }
  
  function alertError(message) {
    toast.error(message);
  }

  const addToMyList = (movie) => {
    console.log("addToMyList called with:", movie);
    // Use the context function to open the modal
    openRatingModal(movie, User);
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

  const updateMovieNote = (movie, newNote) => {
    // First remove the old movie entry
    removeFromMyList(movie);
    
    // Then add the updated movie with the new note
    setTimeout(() => {
      const updatedMovie = {
        ...movie,
        userRating: {
          ...movie.userRating,
          note: newNote
        }
      };
      updateDoc(doc(db, "MyList", User.uid), { movies: arrayUnion(updatedMovie) })
        .then(() => {
          toast.success("Note updated");
        })
        .catch((error) => {
          console.log(error);
          alertError("Failed to update note");
        });
    }, 500);
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
    removeFromMyList, 
    updateMovieNote,
    PopupMessage
  };
}

export default useUpdateMyList;
