import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../axios";
import { countriesList } from "../config/constants";
import Footer from "../components/Footer/Footer";
import useGenresConverter from "../hooks/useGenresConverter";
import useMoviePopup from "../hooks/useMoviePopup";
import useUpdateMyList from "../hooks/useUpdateMyList";
import MovieCard from "../components/Cards/MovieCard";
import { discoverByCountry } from "../config/URLs";

// Icons
import ChevronLeftIcon from "../assets/chevron-left-icon.svg?react";
import ChevronRightIcon from "../assets/chevron-right-icon.svg?react";

function Country() {
  // Router related hooks
  const { countryName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const currentPage = parseInt(queryParams.get("page") || "1");

  // Custom hooks
  const { handleMoviePopup, myListMovies } = useMoviePopup();
  const { convertGenre } = useGenresConverter();
  const myListUtils = useUpdateMyList();
  const { PopupMessage, addToMyList, removeFromMyList } = myListUtils;

  // Country data state
  const [countryCode, setCountryCode] = useState(null);
  const [displayName, setDisplayName] = useState("");

  // Movies data state
  const [movies, setMovies] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Pagination UI state
  const [inputPage, setInputPage] = useState(currentPage);

  // Update input page when URL param changes
  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  // Scroll to top when navigation occurs
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [countryName, currentPage]);

  // Resolve country code from URL parameter
  useEffect(() => {
    if (countryName) {
      const formattedCountryName = countryName.replace(/-/g, " ").toLowerCase();
      const country = countriesList.find(
        (c) => c.name.toLowerCase() === formattedCountryName
      );
      if (country) {
        setCountryCode(country.code);
        setDisplayName(country.name);
      }
    }
  }, [countryName]);

  // Fetch movies by country when country code or page changes
  useEffect(() => {
    if (countryCode) {
      setLoading(true);
      
      axios
        .get(discoverByCountry(countryCode, currentPage))
        .then((response) => {
          // Attach myList status to each movie for UI display
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
          console.error("Error fetching country movies:", error);
          setLoading(false);
        });
    }
  }, [countryCode, currentPage, myListMovies]);

  // Sync UI state when movies are added via the rating modal
  useEffect(() => {
    const handleRatingModalClosed = (event) => {
      const { movieId, success, action } = event.detail;

      if (success && (action === "add" || action === "update")) {
        setMovies((prevMovies) =>
          prevMovies.map((movie) =>
            movie.id === movieId ? { ...movie, isInMyList: true } : movie
          )
        );
      }
    };

    window.addEventListener("ratingModalClosed", handleRatingModalClosed);
    return () => {
      window.removeEventListener("ratingModalClosed", handleRatingModalClosed);
    };
  }, []);

  // Wrapped list functions to ensure UI updates when list operations complete
  const handleAddToMyList = useCallback(
    (movie) => {
      const result = addToMyList(movie);

      result.then((success) => {
        if (success) {
          setMovies((prevMovies) =>
            prevMovies.map((m) =>
              m.id === movie.id ? { ...m, isInMyList: true } : m
            )
          );
        }
      });

      return result;
    },
    [addToMyList]
  );

  const handleRemoveFromMyList = useCallback(
    (movie) => {
      const result = removeFromMyList(movie);

      result.then((success) => {
        if (success) {
          setMovies((prevMovies) =>
            prevMovies.map((m) =>
              m.id === movie.id ? { ...m, isInMyList: false } : m
            )
          );
        }
      });

      return result;
    },
    [removeFromMyList]
  );

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      navigate(`/country/${countryName}?page=${newPage}`);
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
      setInputPage(currentPage);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleGoToPage();
    }
  };

  // UI Component Renderers
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
      {PopupMessage}
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
              addToMyList={handleAddToMyList}
              removeFromMyList={handleRemoveFromMyList}
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

export default Country;
