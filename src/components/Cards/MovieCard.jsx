import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { imageURL2 } from "../../config/constants";
import StarRating from "../StarRating/StarRating";
import { RatingModalContext } from "../../contexts/RatingModalContext";
import { AuthContext } from "../../contexts/UserContext";

// Import SVGs as React Components
import PlayIcon from "../../assets/play-icon.svg?react";
import EditIcon from "../../assets/edit-icon.svg?react";
import AddIcon from "../../assets/add-icon.svg?react";

const MovieCard = ({
  movie,
  handleMoviePopup,
  addToMyList,
  removeFromMyList,
  convertGenre,
}) => {
  const navigate = useNavigate();
  const { User } = useContext(AuthContext);
  const { openRatingModal } = useContext(RatingModalContext) || {};
  const [isInUserList, setIsInUserList] = useState(movie.isInMyList || false);

  // Update local state when movie props change
  useEffect(() => {
    setIsInUserList(movie.isInMyList || false);
  }, [movie.isInMyList]);

  const handleAddToMyList = async (e) => {
    e.stopPropagation();

    try {
      // Show loading indicator or disable button here if needed

      // Call addToMyList and await the result
      const result = await addToMyList(movie);

      // Update local state based on the result
      if (result === true) {
        console.log("Movie added to MyList, updating UI");
        setIsInUserList(true);
      } else {
        console.log("Failed to add movie to MyList or operation was cancelled");
      }
    } catch (error) {
      console.error("Error adding movie to list:", error);
    }
  };

  const handleEditRating = (e) => {
    e.stopPropagation();
    if (openRatingModal) {
      // Pass the updated movie with isInMyList set to true to ensure correct state
      openRatingModal({ ...movie, isInMyList: true }, User);
    } else {
      console.error("openRatingModal is not available");
    }
  };

  const handleRemoveFromMyList = async (e) => {
    e.stopPropagation();

    try {
      // Show loading indicator or disable button here if needed

      // Call removeFromMyList and await the result
      const result = await removeFromMyList(movie);

      // Update local state based on the result
      if (result === true) {
        console.log("Movie removed from MyList, updating UI");
        setIsInUserList(false);
      } else {
        console.log("Failed to remove movie from MyList");
      }
    } catch (error) {
      console.error("Error removing movie from list:", error);
    }
  };

  return (
    <div
      className="cursor-pointer relative group bg-zinc-900 rounded-lg overflow-hidden"
      onClick={() => handleMoviePopup(movie)}
    >
      {/* Movie poster/backdrop */}
      <div className="relative aspect-video">
        <img
          className="w-full h-full object-cover"
          src={
            movie.backdrop_path
              ? imageURL2 + movie.backdrop_path
              : "/placeholder.jpg"
          }
          alt={movie.title || movie.name}
          loading="lazy"
        />

        {/* Play and Add buttons - always visible at top left */}
        <div className="absolute top-2 left-2 flex space-x-2">
          <div
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/play/${movie.id}`);
            }}
            className="text-white w-8 h-8 border-2 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md hover:text-black hover:bg-white transition-all duration-150"
          >
            <PlayIcon className="w-4 h-4" />
          </div>

          {isInUserList ? (
            <div
              onClick={handleEditRating}
              className="bg-cineworldYellow text-white w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md hover:bg-white hover:text-cineworldYellow transition-all duration-150"
            >
              <EditIcon className="w-4 h-4" />
            </div>
          ) : (
            <div
              onClick={handleAddToMyList}
              className="text-white w-8 h-8 border-2 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md hover:text-black hover:bg-white transition-all duration-150"
            >
              <AddIcon className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      <div className="p-3">
        {/* Movie title */}
        <h2 className="text-white text-lg font-bold mb-1 line-clamp-1">
          {movie.title || movie.name}
        </h2>

        {/* Release date */}
        <p className="text-white/80 text-sm mb-2">
          {movie.release_date || movie.first_air_date
            ? new Date(
                movie.release_date || movie.first_air_date
              ).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : "Release date unknown"}
        </p>

        {/* Star rating with number */}
        <div className="flex items-center mb-3">
          <StarRating rating={movie.vote_average} />
        </div>

        {/* Genres */}
        {convertGenre && movie.genre_ids && (
          <div className="flex flex-wrap gap-2">
            {convertGenre(movie.genre_ids)?.map((genre, idx) => (
              <span
                key={idx}
                className="text-white/80 text-sm flex items-center"
              >
                {idx > 0 && <span className="mr-2">•</span>}
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
