import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Removed unused location import
import { AuthContext } from "../contexts/UserContext";
import { RatingModalContext } from "../contexts/RatingModalContext";
import useGenresConverter from "../hooks/useGenresConverter";
import useMoviePopup from "../hooks/useMoviePopup";
import useUpdateMyList from "../hooks/useUpdateMyList";
import Footer from "../components/Footer/Footer";
import StarRating from "../components/StarRating/StarRating";
import { imageUrlBackup } from "../config/constants";
import { getPersonalizedRecommendations } from "../services/RecommendationsService";

// Icons
import PlayIcon from "../assets/play-icon.svg?react";
import EditIcon from "../assets/edit-icon.svg?react";
import AddIcon from "../assets/add-icon.svg?react";
import PlaySolidIcon from "../assets/play-solid-icon.svg?react";

function Recommendations() {
  const navigate = useNavigate();

  // Context and custom hooks
  const { User } = useContext(AuthContext);
  const { handleMoviePopup, myListMovies } = useMoviePopup();
  const { convertGenre } = useGenresConverter();
  const { addToMyList, removeFromMyList } = useUpdateMyList();
  const { openRatingModal } = useContext(RatingModalContext) || {};

  // State management
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noMoviesMessage, setNoMoviesMessage] = useState("");
  const [justAddedMovies, setJustAddedMovies] = useState({});

  // Prevents duplicate API calls during component re-renders
  const fetchedRef = useRef(false);

  // Ensures page starts at the top when navigating to recommendations
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetches personalized movie recommendations for the current user
  useEffect(() => {
    const fetchRecommendations = async () => {
      // Redirect unauthenticated users to sign in
      if (!User) {
        navigate("/signin");
        return;
      }

      // Prevent duplicate API calls
      if (fetchedRef.current) return;
      fetchedRef.current = true;

      try {
        setLoading(true);
        const recommendations = await getPersonalizedRecommendations(User.uid);

        // Enhance recommendations with myList status for UI state management
        const moviesWithMyListStatus = recommendations.map((movie) => ({
          ...movie,
          isInMyList: myListMovies.some((m) => m.id === movie.id),
        }));

        setMovies(moviesWithMyListStatus);

        if (recommendations.length === 0) {
          setNoMoviesMessage("INTERNAL SERVER ERROR");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setLoading(false);
        setNoMoviesMessage(
          "An error occurred while fetching recommendations. Please try again later."
        );
      }
    };

    fetchRecommendations();
  }, [User, myListMovies, navigate]);

  // Handles adding a movie to MyList with optimistic UI updates
  const handleAddToMyList = async (movie) => {
    try {
      const success = await addToMyList(movie);
      if (success) {
        // Update local state for immediate UI feedback before global state updates
        setJustAddedMovies((prev) => ({ ...prev, [movie.id]: true }));
      }
    } catch (error) {
      console.error("Error adding to list:", error);
    }
  };

  // Skeleton loading components for the recommendations
  const SkeletonMovieItem = () => {
    return (
      <>
        {/* Mobile view skeleton (2 per row) */}
        <div className="md:hidden bg-zinc-900 rounded-lg overflow-hidden h-full flex flex-col">
          {/* Poster skeleton */}
          <div className="w-full relative">
            <div className="w-full aspect-[16/9] bg-zinc-800 animate-pulse"></div>
            {/* Action buttons placeholder */}
            <div className="absolute top-2 left-2 flex space-x-2">
              <div className="bg-zinc-800 w-7 h-7 rounded-full animate-pulse"></div>
              <div className="bg-zinc-800 w-7 h-7 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Card content skeleton */}
          <div className="p-2 flex-grow">
            {/* Title skeleton */}
            <div className="bg-zinc-800 h-5 w-4/5 rounded-md animate-pulse mb-1"></div>
            {/* Date skeleton */}
            <div className="bg-zinc-800 h-3 w-1/3 rounded-md animate-pulse mb-1"></div>
            {/* Rating skeleton */}
            <div className="flex mb-1">
              <div className="bg-zinc-800 h-4 w-24 rounded-md animate-pulse"></div>
            </div>
            {/* Genres skeleton */}
            <div className="flex items-center">
              <div className="bg-zinc-800 h-3 w-16 rounded-md animate-pulse"></div>
              <div className="mx-1 text-white/60">•</div>
              <div className="bg-zinc-800 h-3 w-16 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Desktop/Tablet view skeleton */}
        <div className="hidden md:block bg-zinc-900 rounded-lg overflow-hidden mb-6">
          <div className="flex flex-row">
            {/* Movie poster skeleton */}
            <div className="w-1/5 lg:w-1/6 relative">
              <div className="w-full aspect-[2/3] bg-zinc-800 animate-pulse"></div>
            </div>

            {/* Movie details skeleton */}
            <div className="w-4/5 lg:w-5/6 p-4 md:p-6 flex flex-col">
              {/* Title skeleton */}
              <div className="bg-zinc-800 h-8 w-3/4 rounded-md animate-pulse mb-2"></div>
              
              {/* Date skeleton */}
              <div className="mb-2">
                <div className="bg-zinc-800 h-5 w-1/3 rounded-md animate-pulse"></div>
              </div>
              
              {/* Rating skeleton */}
              <div className="mb-3">
                <div className="bg-zinc-800 h-6 w-32 rounded-md animate-pulse"></div>
              </div>
              
              {/* Genres skeleton */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="bg-zinc-800 h-8 w-20 rounded-full animate-pulse"></div>
                <div className="bg-zinc-800 h-8 w-24 rounded-full animate-pulse"></div>
                <div className="bg-zinc-800 h-8 w-16 rounded-full animate-pulse"></div>
              </div>
              
              {/* Overview skeleton */}
              <div className="mb-4">
                <div className="bg-zinc-800 h-4 w-full rounded-md animate-pulse mb-1"></div>
                <div className="bg-zinc-800 h-4 w-full rounded-md animate-pulse mb-1"></div>
                <div className="bg-zinc-800 h-4 w-3/4 rounded-md animate-pulse"></div>
              </div>
              
              {/* Buttons skeleton */}
              <div className="flex mt-auto space-x-3">
                <div className="bg-zinc-800 h-10 w-24 rounded-md animate-pulse"></div>
                <div className="bg-zinc-800 h-10 w-36 rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Movie list item component for both mobile and desktop views
  const MovieListItem = ({ movie }) => {
    // Determine if movie is in user's list (either from context or just added locally)
    const isInList = movie.isInMyList || justAddedMovies[movie.id];

    return (
      <>
        {/* Mobile view - Card layout (2 per row) */}
        <div
          className="md:hidden bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-colors duration-200 cursor-pointer h-full flex flex-col"
          onClick={() => handleMoviePopup(movie)}
        >
          {/* Movie poster - full width on mobile */}
          <div className="w-full relative">
            <img
              className="w-full aspect-[16/9] object-cover"
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
                  navigate(`/play/${movie.id}`);
                }}
                className="text-white w-7 h-7 border-2 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md hover:text-black hover:bg-white transition-all duration-150"
              >
                <PlayIcon className="w-3 h-3" />
              </div>

              {isInList ? (
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
                  <EditIcon className="w-3 h-3" />
                </div>
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToMyList(movie);
                  }}
                  className="text-white w-7 h-7 border-2 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md hover:text-black hover:bg-white transition-all duration-150"
                >
                  <AddIcon className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>

          {/* Card content */}
          <div className="p-2 flex-grow">
            {/* Movie title */}
            <h2 className="text-white text-base font-bold mb-1 line-clamp-1">
              {movie.title || movie.name}
            </h2>

            {/* Release date */}
            <p className="text-white/80 text-xs mb-1">
              {movie.release_date || movie.first_air_date
                ? new Date(
                    movie.release_date || movie.first_air_date
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                  })
                : "Release date unknown"}
            </p>

            {/* Star rating */}
            <div className="flex items-center mb-1">
              <StarRating rating={movie.vote_average} size="small" />
            </div>

            {/* Genres - horizontal dot-separated format */}
            {convertGenre && movie.genre_ids && (
              <div className="flex items-center">
                {convertGenre(movie.genre_ids)
                  ?.slice(0, 3)
                  .map((genre, idx) => (
                    <React.Fragment key={idx}>
                      <span className="text-white/80 text-xs">{genre}</span>
                      {idx <
                        Math.min(convertGenre(movie.genre_ids).length, 3) -
                          1 && <span className="text-white/60 mx-1">•</span>}
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
            <div
              className="w-1/5 lg:w-1/6 relative cursor-pointer"
              onClick={() => handleMoviePopup(movie)}
            >
              <img
                className="w-full aspect-[2/3] object-cover"
                src={
                  movie.poster_path
                    ? imageUrlBackup + movie.poster_path
                    : "/placeholder.jpg"
                }
                alt={movie.title || movie.name}
                loading="lazy"
              />

              {/* Overlay with play button on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="bg-cineworldYellow text-white w-10 h-10 rounded-full flex items-center justify-center">
                  <PlaySolidIcon className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Movie details - takes up even more width */}
            <div
              className="w-4/5 lg:w-5/6 p-4 md:p-6 flex flex-col cursor-pointer"
              onClick={() => handleMoviePopup(movie)}
            >
              <h2 className="text-white text-xl md:text-2xl font-bold mb-2">
                {movie.title || movie.name}
              </h2>

              {/* Date in its own row */}
              <div className="mb-2">
                <span className="text-white/80 text-sm">
                  {movie.release_date || movie.first_air_date
                    ? new Date(
                        movie.release_date || movie.first_air_date
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Release date unknown"}
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
                    <span
                      key={idx}
                      className="bg-zinc-800 text-white/80 text-sm px-3 py-1 rounded-full"
                    >
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
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Play
                </button>

                {isInList ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (openRatingModal) {
                        openRatingModal(movie, User);
                      } else {
                        removeFromMyList(movie);
                      }
                    }}
                    className="bg-white text-black hover:bg-black hover:text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
                  >
                    <EditIcon className="w-5 h-5 mr-2" />
                    Update Your Rating
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToMyList(movie);
                    }}
                    className="border border-white text-white hover:bg-white hover:text-black px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
                  >
                    <AddIcon className="w-5 h-5 mr-2" />
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
        <h1 className="text-white text-2xl md:text-4xl font-bold">
          Explore this curated list of must-watch movies, just for you.
        </h1>
      </div>

      {/* Content container with loading, results or error states */}
      <div className="px-4 md:px-8 pb-12 w-full">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-0">
            {[...Array(6)].map((_, index) => (
              <div className="mb-0 md:mb-6" key={`skeleton-${index}`}>
                <SkeletonMovieItem />
              </div>
            ))}
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
