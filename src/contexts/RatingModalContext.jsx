import React, { createContext, useState } from "react";
import RatingModal from "../components/Modals/RatingModal";
import { updateDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import toast from "react-hot-toast";

export const RatingModalContext = createContext();

export const RatingModalProvider = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [user, setUser] = useState(null);

  const openRatingModal = (movie, currentUser) => {
    console.log("Opening rating modal for:", movie);
    setSelectedMovie(movie);
    setUser(currentUser);
    setShowModal(true);
  };

  const closeRatingModal = () => {
    setShowModal(false);
    setSelectedMovie(null);
  };

  const addRatedMovieToList = (ratedMovie) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    console.log("Adding rated movie to list:", ratedMovie);
    updateDoc(doc(db, "MyList", user.uid), { movies: arrayUnion(ratedMovie) })
      .then(() => {
        console.log("Rated movie added to MyList");
        toast.success("Movie added to MyList");
        closeRatingModal();
      })
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
        toast.error(error.message);
      });
  };

  return (
    <RatingModalContext.Provider
      value={{
        openRatingModal,
        closeRatingModal,
      }}
    >
      {children}
      {showModal && selectedMovie && (
        <RatingModal
          movie={selectedMovie}
          onClose={closeRatingModal}
          onSave={addRatedMovieToList}
        />
      )}
    </RatingModalContext.Provider>
  );
}; 