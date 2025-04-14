import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { imageURL2 } from "../../config/constants";
import StarRating from "../StarRating/StarRating";
import { RatingModalContext } from "../../contexts/RatingModalContext";
import { AuthContext } from "../../contexts/UserContext";

const MovieCard = ({ 
  movie, 
  handleMoviePopup, 
  addToMyList, 
  removeFromMyList, 
  convertGenre 
}) => {
  const navigate = useNavigate();
  const { User } = useContext(AuthContext);
  const { openRatingModal } = useContext(RatingModalContext) || {};

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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          </div>
          
          {movie.isInMyList ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (openRatingModal) {
                  openRatingModal(movie, User);
                } else {
                  removeFromMyList(movie);
                }
              }}
              className="bg-cineworldYellow text-white w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md hover:bg-white hover:text-cineworldYellow transition-all duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </div>
          ) : (
            <div
              onClick={(e) => {
                e.stopPropagation();
                addToMyList(movie);
              }}
              className="text-white w-8 h-8 border-2 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md hover:text-black hover:bg-white transition-all duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-3">
        {/* Movie title */}
        <h2 className="text-white text-lg font-bold mb-1 line-clamp-1">{movie.title || movie.name}</h2>
        
        {/* Release date */}
        <p className="text-white/80 text-sm mb-2">
          {movie.release_date || movie.first_air_date ? new Date(movie.release_date || movie.first_air_date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }) : 'Release date unknown'}
        </p>
        
        {/* Star rating with number */}
        <div className="flex items-center mb-3">
          <StarRating rating={movie.vote_average} />
        </div>
        
        {/* Genres */}
        {convertGenre && movie.genre_ids && (
          <div className="flex flex-wrap gap-2">
            {convertGenre(movie.genre_ids)?.map((genre, idx) => (
              <span key={idx} className="text-white/80 text-sm flex items-center">
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