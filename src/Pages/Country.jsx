import React, { useContext, useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../axios";
import { API_KEY } from "../config/constants";
import { imageURL2 } from "../config/constants";
import { AuthContext } from "../contexts/UserContext";
import Footer from "../components/Footer/Footer";
import useGenresConverter from "../hooks/useGenresConverter";
import useMoviePopup from "../hooks/useMoviePopup";
import useUpdateMyList from "../hooks/useUpdateMyList";
import { RatingModalContext } from "../contexts/RatingModalContext";
import StarRating from "../components/StarRating/StarRating";
import MovieCard from "../components/Cards/MovieCard";

// Icons
import ChevronLeftIcon from "../assets/chevron-left-icon.svg?react";
import ChevronRightIcon from "../assets/chevron-right-icon.svg?react";

function Country() {
  const { countryName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const currentPage = parseInt(queryParams.get("page") || "1");

  const { User } = useContext(AuthContext);
  const { handleMoviePopup, myListMovies } = useMoviePopup();
  const { convertGenre } = useGenresConverter();
  const myListUtils = useUpdateMyList();
  const { PopupMessage, addToMyList, removeFromMyList } = myListUtils;
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openRatingModal } = useContext(RatingModalContext) || {};
  const [displayName, setDisplayName] = useState("");
  const [countryCode, setCountryCode] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState(currentPage);

  // Country mapping
  const countries = [
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "AU", name: "Australia" },
    { code: "FR", name: "France" },
    { code: "DE", name: "Germany" },
    { code: "IT", name: "Italy" },
    { code: "IN", name: "India" },
    { code: "JP", name: "Japan" },
    { code: "KR", name: "South Korea" },
    { code: "HK", name: "Hong Kong" },
    { code: "CN", name: "China" },
  ];

  // Update input page when current page changes
  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  // Scroll to top when component mounts or page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [countryName, currentPage]);

  // Get country code from name
  useEffect(() => {
    if (countryName) {
      const formattedCountryName = countryName.replace(/-/g, " ").toLowerCase();
      const country = countries.find(
        (c) => c.name.toLowerCase() === formattedCountryName
      );
      if (country) {
        setCountryCode(country.code);
        setDisplayName(country.name);
      }
    }
  }, [countryName]);

  // Fetch movies by country
  useEffect(() => {
    if (countryCode) {
      setLoading(true);
      const url = `discover/movie?api_key=${API_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=1000&include_adult=false&include_video=false&page=${currentPage}&with_origin_country=${countryCode}`;

      axios
        .get(url)
        .then((response) => {
          // Add isInMyList property to each movie
          const moviesWithMyListStatus = response.data.results.map((movie) => ({
            ...movie,
            isInMyList: myListMovies.some((m) => m.id === movie.id),
          }));
          setMovies(moviesWithMyListStatus);
          setTotalPages(
            response.data.total_pages > 500 ? 500 : response.data.total_pages
          ); // TMDB API limits to 500 pages
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching country movies:", error);
          setLoading(false);
        });
    }
  }, [countryCode, currentPage, myListMovies]);

  // Handle movies being added to MyList via the rating modal
  useEffect(() => {
    const handleRatingModalClosed = (event) => {
      const { movieId, success, action } = event.detail;

      if (success && (action === "add" || action === "update")) {
        // Update the movies state to show that the movie is now in MyList
        setMovies((prevMovies) =>
          prevMovies.map((movie) =>
            movie.id === movieId ? { ...movie, isInMyList: true } : movie
          )
        );
      }
    };

    // Add event listener
    window.addEventListener("ratingModalClosed", handleRatingModalClosed);

    // Clean up
    return () => {
      window.removeEventListener("ratingModalClosed", handleRatingModalClosed);
    };
  }, []);

  // Create wrapped versions of list functions to update UI state
  const handleAddToMyList = useCallback(
    (movie) => {
      const result = addToMyList(movie);

      // When the result resolves, update the UI
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

      // When the result resolves, update the UI
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

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      navigate(`/country/${countryName}?page=${newPage}`);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setInputPage(value);
    }
  };

  // Handle Go button click or Enter key
  const handleGoToPage = () => {
    const pageNum = parseInt(inputPage);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum);
    } else {
      // Reset to current page if invalid
      setInputPage(currentPage);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleGoToPage();
    }
  };

  // Generate pagination UI
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
