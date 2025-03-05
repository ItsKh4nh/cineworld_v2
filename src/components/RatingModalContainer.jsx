import React, { useContext } from "react";
import RatingModal from "./Modals/RatingModal";
import useUpdateMyList from "../hooks/useUpdateMyList";

function RatingModalContainer() {
  const { 
    showRatingModal, 
    selectedMovie, 
    closeRatingModal, 
    addRatedMovieToList 
  } = useUpdateMyList();

  if (!showRatingModal) return null;

  return (
    <RatingModal
      movie={selectedMovie}
      onClose={closeRatingModal}
      onSave={addRatedMovieToList}
    />
  );
}

export default RatingModalContainer; 