import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { imageUrlBackup } from "../../config/constants";
import StarRating from "../StarRating/StarRating";
import { RatingModalContext } from "../../contexts/RatingModalContext";
import { AuthContext } from "../../contexts/UserContext";
import { slugify } from "../../utils";

// Icons
import PlayIcon from "../../assets/play-icon.svg?react";
import EditIcon from "../../assets/edit-icon.svg?react";
import AddIcon from "../../assets/add-icon.svg?react";

const MovieCard = ({ movie, handleMoviePopup, addToMyList, convertGenre }) => {
  const navigate = useNavigate();
  const { User } = useContext(AuthContext);
  const { openRatingModal } = useContext(RatingModalContext) || {};
  const [isInUserList, setIsInUserList] = useState(movie.isInMyList || false);

  // Sync local state with props when they change
  useEffect(() => {
    setIsInUserList(movie.isInMyList || false);
  }, [movie.isInMyList]);

  // Event handlers with proper error handling
  const handleAddToMyList = async (e) => {
    e.stopPropagation();

    try {
      const result = await addToMyList(movie);

      if (result === true) {
        setIsInUserList(true);
      }
    } catch (error) {
      console.error("Error adding movie to list:", error);
    }
  };

  const handleEditRating = (e) => {
    e.stopPropagation();
    if (openRatingModal) {
      // Ensure correct state is passed to modal
      openRatingModal({ ...movie, isInMyList: true }, User);
    } else {
      console.error("openRatingModal is not available");
    }
  };

  const formatReleaseDate = (dateString) => {
    if (!dateString) return "Release date unknown";

    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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
              ? imageUrlBackup + movie.backdrop_path
              : "/placeholder.jpg"
          }
          alt={movie.title || movie.name}
          loading="lazy"
        />

        {/* Action buttons overlay */}
        <div className="absolute top-2 left-2 flex space-x-2">
          <div
            onClick={(e) => {
              e.stopPropagation();
              const title = movie.title || movie.name || '';
              navigate(`/play/${movie.id}-${slugify(title)}`);
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

      {/* Movie details section */}
      <div className="p-3">
        <h2 className="text-white text-lg font-bold mb-1 line-clamp-1">
          {movie.title || movie.name}
        </h2>

        <p className="text-white/80 text-sm mb-2">
          {formatReleaseDate(movie.release_date || movie.first_air_date)}
        </p>

        <div className="flex items-center mb-3">
          <StarRating rating={movie.vote_average} />
        </div>

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
