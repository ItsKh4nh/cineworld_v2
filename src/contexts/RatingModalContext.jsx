import React, { createContext, useState, useEffect } from "react";
import RatingModal from "../components/Modals/RatingModal";
import { updateDoc, doc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const RatingModalContext = createContext();

export const RatingModalProvider = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [user, setUser] = useState(null);
  const [userMovies, setUserMovies] = useState([]);
  const navigate = useNavigate();

  const openRatingModal = async (movie, currentUser) => {
    console.log("Opening rating modal for:", movie);
    setSelectedMovie(movie);
    setUser(currentUser);
    
    // Check if movie already exists in user's MyList
    if (currentUser) {
      try {
        const docRef = doc(db, "MyList", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserMovies(data.movies || []);
          
          // Check if movie with same ID already exists in the list
          const existingMovie = data.movies?.find(m => m.id === movie.id);
          
          // If movie exists, update the selectedMovie with the existing data
          if (existingMovie) {
            setSelectedMovie({
              ...movie,
              userRating: existingMovie.userRating
            });
          }
        }
      } catch (error) {
        console.error("Error checking for existing movie:", error);
      }
    }
    
    setShowModal(true);
  };

  const closeRatingModal = () => {
    setShowModal(false);
    setSelectedMovie(null);
  };
  
  const goToMyList = () => {
    closeRatingModal();
    navigate("/mylist");
  };

  const addRatedMovieToList = async (ratedMovie) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    console.log("Adding rated movie to list:", ratedMovie);
    
    try {
      // Check if the movie already exists in the list
      const userDocRef = doc(db, "MyList", user.uid);
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
          toast.success("Rating updated successfully!");
        } else {
          // Movie doesn't exist, add it to the list
          await updateDoc(userDocRef, { movies: arrayUnion(ratedMovie) });
          console.log("Rated movie added to MyList");
          toast.success("Movie added to MyList");
        }
      } else {
        // Document doesn't exist, create it with the movie
        await updateDoc(userDocRef, { movies: arrayUnion(ratedMovie) });
        console.log("Rated movie added to MyList");
        toast.success("Movie added to MyList");
      }
      
      closeRatingModal();
    } catch (error) {
      console.log(error.code);
      console.log(error.message);
      toast.error(error.message);
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