import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../axios";
import { genresList } from "../config/constants";
import { AuthContext } from "../contexts/UserContext";
import Footer from "../components/Footer/Footer";
import useGenresConverter from "../hooks/useGenresConverter";
import useMoviePopup from "../hooks/useMoviePopup";
import useUpdateMyList from "../hooks/useUpdateMyList";
import { RatingModalContext } from "../contexts/RatingModalContext";
import MovieCard from "../components/Cards/MovieCard";

// Icons
import ChevronLeftIcon from "../assets/chevron-left-icon.svg?react";
import ChevronRightIcon from "../assets/chevron-right-icon.svg?react";

/**
 * Genre page component that displays movies filtered by a specific genre
 * with pagination support
 */
function Genre() {
  // URL and routing parameters
  const { genreName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const currentPage = parseInt(queryParams.get("page") || "1");

  // Hooks and contexts
  const { User } = useContext(AuthContext);
  const { handleMoviePopup, myListMovies } = useMoviePopup();
  const { convertGenre } = useGenresConverter();
  const { addToMyList, removeFromMyList } = useUpdateMyList();
  const { openRatingModal } = useContext(RatingModalContext) || {};

  // UI State
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState(currentPage);

  // Data State
  const [movies, setMovies] = useState([]);
  const [genreId, setGenreId] = useState(null);

  // Sync input page field with URL page parameter
  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  // Scroll to top when changing pages or genres
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [genreName, currentPage]);

  // Resolve genre ID from URL parameter
  useEffect(() => {
    if (genreName) {
      const formattedGenreName = genreName.replace(/-/g, " ").toLowerCase();
      const genre = genresList.find(
        (g) => g.name.toLowerCase() === formattedGenreName
      );
      if (genre) {
        setGenreId(genre.id);
        setDisplayName(genre.name);
      }
    }
  }, [genreName]);

  // Fetch movies when genre ID or page changes
  useEffect(() => {
    if (genreId) {
      setLoading(true);

      const url = `discover/movie?api_key=${
        import.meta.env.VITE_TMDB_API_KEY
      }&language=en-US&sort_by=vote_average.desc&vote_count.gte=1000&with_genres=${genreId}&page=${currentPage}`;

      axios
        .get(url)
        .then((response) => {
          // Mark movies that are already in user's list
          const moviesWithMyListStatus = response.data.results.map((movie) => ({
            ...movie,
            isInMyList: myListMovies.some((m) => m.id === movie.id),
          }));
          setMovies(moviesWithMyListStatus);

          // TMDB API limits to 500 pages
          setTotalPages(
            response.data.total_pages > 500 ? 500 : response.data.total_pages
          );
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching genre movies:", error);
          setLoading(false);
        });
    }
  }, [genreId, currentPage, myListMovies]);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      navigate(`/genre/${genreName}?page=${newPage}`);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setInputPage(value);
    }
  };

  const handleGoToPage = () => {
    const pageNum = parseInt(inputPage);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum);
    } else {
      setInputPage(currentPage); // Reset to current page if invalid
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleGoToPage();
    }
  };

  // Pagination UI component
  const renderPagination = () => {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              currentPage <= 1
                ? "bg-gray-700 text-gray-500"
                : "bg-gray-800 text-white hover:bg-gray-700"
            } transition-colors`}
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>

          <div className="flex items-center bg-gray-800 rounded-full px-4 py-2">
            <span className="text-white mr-2">Page</span>
            <input
              type="text"
              value={inputPage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-12 bg-gray-700 text-white text-center rounded px-2 py-1 mx-1"
            />
            <span className="text-white ml-1">/ {totalPages}</span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              currentPage >= totalPages
                ? "bg-gray-700 text-gray-500"
                : "bg-gray-800 text-white hover:bg-gray-700"
            } transition-colors`}
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>

        <button
          onClick={handleGoToPage}
          className="mt-2 px-6 py-1 bg-red-800 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
        >
          Go
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-24 pb-8 px-8">
        <h1 className="text-white text-4xl font-bold">{displayName} Movies</h1>
      </div>

      {/* Movies grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-4 md:px-8 pb-12">
        {loading ? (
          <div className="col-span-full flex justify-center items-center h-64">
            <p className="text-white text-lg">Loading...</p>
          </div>
        ) : movies.length > 0 ? (
          movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              handleMoviePopup={handleMoviePopup}
              addToMyList={addToMyList}
              removeFromMyList={removeFromMyList}
              convertGenre={convertGenre}
            />
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center h-64">
            <p className="text-white text-lg">No movies found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pb-12">{renderPagination()}</div>
      )}

      <Footer />
    </div>
  );
}

export default Genre;
