import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/UserContext";
import { RatingModalContext } from "../contexts/RatingModalContext";
import useGenresConverter from "../hooks/useGenresConverter";
import useMoviePopup from "../hooks/useMoviePopup";
import useUpdateMyList from "../hooks/useUpdateMyList";
import Footer from "../components/Footer/Footer";
import StarRating from "../components/StarRating/StarRating";
import { imageURL2 } from "../config/constants";
import { getPersonalizedRecommendations } from "../services/RecommendationsService";

function Recommendations() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const { User } = useContext(AuthContext);
  const { handleMoviePopup, myListMovies } = useMoviePopup();
  const { convertGenre } = useGenresConverter();
  const { addToMyList, removeFromMyList } = useUpdateMyList();
  const { openRatingModal } = useContext(RatingModalContext) || {};

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noMoviesMessage, setNoMoviesMessage] = useState("");

  const fetchedRef = useRef(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!User) {
        navigate("/signin");
        return;
      }
      
      if (fetchedRef.current) return;
      fetchedRef.current = true;

      try {
        setLoading(true);
        const recommendations = await getPersonalizedRecommendations(User.uid);

        // Add isInMyList property to each movie
        const moviesWithMyListStatus = recommendations.map(movie => ({
          ...movie,
          isInMyList: myListMovies.some(m => m.id === movie.id)
        }));

        setMovies(moviesWithMyListStatus);

        if (recommendations.length === 0) {
          setNoMoviesMessage("INTERNAL SERVER ERROR");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setLoading(false);
        setNoMoviesMessage("An error occurred while fetching recommendations. Please try again later.");
      }
    };

    fetchRecommendations();
  }, [User, myListMovies]);

  // Movie list item component
  const MovieListItem = ({ movie }) => {
    return (
      <>
        {/* Mobile view - Card layout (2 per row) */}
        <div className="md:hidden bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-colors duration-200 cursor-pointer h-full flex flex-col" onClick={() => handleMoviePopup(movie)}>
          {/* Movie poster - full width on mobile */}
          <div className="w-full relative">
            <img
              className="w-full aspect-[16/9] object-cover"
              src={movie.backdrop_path ? imageURL2 + movie.backdrop_path : "/placeholder.jpg"}
              alt={movie.title || movie.name}
              loading="lazy"
            />
            
            {/* Play and Add buttons on image */}
            <div className="absolute top-2 left-2 flex space-x-2">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/play/${movie.id}`);
                }}
                className="text-white w-7 h-7 border-2 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md hover:text-black hover:bg-white transition-all duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
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
                  className="bg-cineworldYellow text-white w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md hover:bg-white hover:text-cineworldYellow transition-all duration-150"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </div>
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    addToMyList(movie);
                  }}
                  className="text-white w-7 h-7 border-2 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md hover:text-black hover:bg-white transition-all duration-150"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          
          {/* Card content */}
          <div className="p-2 flex-grow">
            {/* Movie title */}
            <h2 className="text-white text-base font-bold mb-1 line-clamp-1">{movie.title || movie.name}</h2>
            
            {/* Release date */}
            <p className="text-white/80 text-xs mb-1">
              {movie.release_date || movie.first_air_date 
                ? new Date(movie.release_date || movie.first_air_date).toLocaleDateString('en-US', {
                    year: 'numeric'
                  }) 
                : 'Release date unknown'
              }
            </p>
            
            {/* Star rating */}
            <div className="flex items-center mb-1">
              <StarRating rating={movie.vote_average} size="small" />
            </div>
            
            {/* Genres - horizontal dot-separated format */}
            {convertGenre && movie.genre_ids && (
              <div className="flex items-center">
                {convertGenre(movie.genre_ids)?.slice(0, 3).map((genre, idx) => (
                  <React.Fragment key={idx}>
                    <span className="text-white/80 text-xs">{genre}</span>
                    {idx < Math.min(convertGenre(movie.genre_ids).length, 3) - 1 && (
                      <span className="text-white/60 mx-1">•</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop/Tablet view - List layout */}
        <div className="hidden md:block bg-zinc-900 rounded-lg overflow-hidden mb-6 hover:bg-zinc-800 transition-colors duration-200">
          <div className="flex flex-row">
            {/* Movie poster/image - even smaller size */}
            <div className="w-1/5 lg:w-1/6 relative cursor-pointer" onClick={() => handleMoviePopup(movie)}>
              <img
                className="w-full aspect-[2/3] object-cover"
                src={movie.poster_path ? imageURL2 + movie.poster_path : "/placeholder.jpg"}
                alt={movie.title || movie.name}
                loading="lazy"
              />
              
              {/* Overlay with play button on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="bg-cineworldYellow text-white w-10 h-10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Movie details - takes up even more width */}
            <div className="w-4/5 lg:w-5/6 p-4 md:p-6 flex flex-col cursor-pointer" onClick={() => handleMoviePopup(movie)}>
              <h2 className="text-white text-xl md:text-2xl font-bold mb-2">{movie.title || movie.name}</h2>
              
              {/* Date in its own row */}
              <div className="mb-2">
                <span className="text-white/80 text-sm">
                  {movie.release_date || movie.first_air_date 
                    ? new Date(movie.release_date || movie.first_air_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      }) 
                    : 'Release date unknown'
                  }
                </span>
              </div>
              
              {/* Rating in a separate row */}
              <div className="mb-3">
                <StarRating rating={movie.vote_average} />
              </div>
              
              {/* Genres */}
              {convertGenre && movie.genre_ids && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {convertGenre(movie.genre_ids)?.map((genre, idx) => (
                    <span key={idx} className="bg-zinc-800 text-white/80 text-sm px-3 py-1 rounded-full">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Overview/description */}
              <p className="text-white/70 text-sm md:text-base mb-4 line-clamp-2 md:line-clamp-3">
                {movie.overview || "No description available."}
              </p>
              
              {/* Action buttons */}
              <div className="flex mt-auto space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/play/${movie.id}`);
                  }}
                  className="bg-cineworldYellow hover:bg-white hover:text-cineworldYellow text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                  Play
                </button>
                
                {movie.isInMyList ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (openRatingModal) {
                        openRatingModal(movie, User);
                      } else {
                        removeFromMyList(movie);
                      }
                    }}
                    className="border border-white text-white hover:bg-white hover:text-black px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToMyList(movie);
                    }}
                    className="border border-white text-white hover:bg-white hover:text-black px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add to MyList
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-24 pb-8 px-4 md:px-8">
        <h1 className="text-white text-2xl md:text-4xl font-bold">Explore this curated list of must-watch movies, just for you.</h1>
      </div>

      {/* Movies list - full width container */}
      <div className="px-4 md:px-8 pb-12 w-full">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-white text-lg">Loading recommendations...</p>
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-0">
            {movies.map((movie) => (
              <div className="mb-0 md:mb-6" key={movie.id}>
                <MovieListItem movie={movie} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64 px-6">
            <p className="text-white text-lg text-center">{noMoviesMessage}</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Recommendations; 