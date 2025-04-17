import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axios";
import { searchMovie, searchPerson } from "../config/URLs";
import useGenresConverter from "../hooks/useGenresConverter";
import useMoviePopup from "../hooks/useMoviePopup";
import useUpdateMyList from "../hooks/useUpdateMyLis";
import MovieCard from "../components/Cards/MovieCard";
import PersonCard from "../components/Cards/PersonCard";

// Icons
import ClearIcon from "../assets/clear-icon.svg?react";

function Search() {
  const navigate = useNavigate();

  // Hooks for movie functionality
  const { handleMoviePopup, myListMovies } = useMoviePopup();
  const { convertGenre } = useGenresConverter();
  const myListUtils = useUpdateMyList();
  const { PopupMessage, addToMyList, removeFromMyList } = myListUtils;

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState("movie"); // 'movie' or 'person'
  const [isSearching, setIsSearching] = useState(false);

  // Scroll to top when component mounts for better UX
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Search with debounce to improve performance and reduce API calls
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch();
      } else if (searchQuery.trim() === "") {
        setSearchResults([]);
      }
    }, 500); // 500ms delay to avoid too many API calls

    return () => clearTimeout(delaySearch);
  }, [searchQuery, searchType]);

  // Listen for rating modal interactions to update UI
  useEffect(() => {
    const handleRatingModalClosed = (event) => {
      const { movieId, success, action } = event.detail;

      if (success && (action === "add" || action === "update")) {
        // Update the searchResults to show that the movie is now in MyList
        setSearchResults((prevResults) =>
          prevResults.map((movie) =>
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

  // Search functionality
  const performSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;

    setIsSearching(true);
    try {
      if (searchType === "movie") {
        const response = await axios.get(searchMovie(searchQuery));

        // Filter out future releases and add myList status
        const currentDate = new Date();
        const filteredResults = response.data.results
          .filter((movie) => {
            if (!movie.release_date) return true;
            const releaseDate = new Date(movie.release_date);
            return releaseDate <= currentDate;
          })
          .map((movie) => ({
            ...movie,
            isInMyList: myListMovies.some((m) => m.id === movie.id),
          }));

        setSearchResults(filteredResults);
      } else {
        const response = await axios.get(searchPerson(searchQuery));
        setSearchResults(response.data.results);
      }
    } catch (error) {
      console.error(`Error searching ${searchType}s:`, error);
    } finally {
      setIsSearching(false);
    }
  };

  // Search UI control functions
  const clearSearchQuery = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const toggleSearchType = (type) => {
    if (type !== searchType) {
      setSearchType(type);
      clearSearchQuery();
    }
  };

  // Navigation functions
  const handlePersonClick = (person) => {
    navigate(`/people/${person.id}`);
  };

  // MyList management with UI state updates
  const handleAddToMyList = useCallback(
    (movie) => {
      const result = addToMyList(movie);

      // When the result resolves, update the UI
      result.then((success) => {
        if (success) {
          setSearchResults((prevResults) =>
            prevResults.map((m) =>
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
          setSearchResults((prevResults) =>
            prevResults.map((m) =>
              m.id === movie.id ? { ...m, isInMyList: false } : m
            )
          );
        }
      });

      return result;
    },
    [removeFromMyList]
  );

  return (
    <div className="min-h-screen bg-black">
      {PopupMessage}
      <div className="pt-20 pb-8 px-4 md:px-8">
        {/* Search controls with toggle */}
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search input with clear button */}
            <div className="flex-1 relative">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                className="w-full bg-stone-700 text-white outline-none rounded focus:ring-red-600 focus:border-red-600 block p-2.5 placeholder:text-white/80"
                placeholder={`Search for ${
                  searchType === "movie" ? "movies" : "people"
                }... (min 2 characters)`}
              />
              {isSearching ? (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              ) : (
                <button
                  onClick={clearSearchQuery}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600 hover:text-red-500 focus:outline-none"
                >
                  <ClearIcon className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>

          {/* Toggle switch */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => toggleSearchType("movie")}
                className={`px-4 py-2 rounded-md transition-all duration-200 ${
                  searchType === "movie"
                    ? "bg-cineworldYellow text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => toggleSearchType("person")}
                className={`px-4 py-2 rounded-md transition-all duration-200 ${
                  searchType === "person"
                    ? "bg-cineworldYellow text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                People
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search results section */}
      <div className="px-4 md:px-8">
        {/* Movies results */}
        {searchType === "movie" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {searchResults.length > 0 ? (
              searchResults.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  handleMoviePopup={handleMoviePopup}
                  addToMyList={handleAddToMyList}
                  removeFromMyList={handleRemoveFromMyList}
                  convertGenre={convertGenre}
                />
              ))
            ) : searchQuery.trim() !== "" && !isSearching ? (
              <div className="col-span-full flex justify-center items-center h-64">
                <p className="text-white text-lg">No movies found</p>
              </div>
            ) : (
              !isSearching && (
                <div className="col-span-full flex justify-center items-center h-64">
                  <p className="text-white text-lg">
                    Search for movies to display results
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* People results */}
        {searchType === "person" && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {searchResults.length > 0 ? (
              searchResults.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  handlePersonClick={handlePersonClick}
                />
              ))
            ) : searchQuery.trim() !== "" && !isSearching ? (
              <div className="col-span-full flex justify-center items-center h-64">
                <p className="text-white text-lg">No people found</p>
              </div>
            ) : (
              !isSearching && (
                <div className="col-span-full flex justify-center items-center h-64">
                  <p className="text-white text-lg">
                    Search for people to display results
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
