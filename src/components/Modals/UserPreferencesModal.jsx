import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/FirebaseConfig";
import { imageURL2, genresList } from "../../config/constants";
import axios from "../../axios";
import { searchMovie, searchPerson } from "../../config/URLs";
import StarRating from "../StarRating/StarRating";

// Import SVGs as React Components
import CloseIcon from "../../assets/close-icon.svg?react";

function UserPreferencesModal({ user, onClose }) {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [movieRatings, setMovieRatings] = useState({});
  const [searchType, setSearchType] = useState("movie");

  // Implement realtime search as user types
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      }
    }, 500); // 500ms delay to avoid too many API calls

    return () => clearTimeout(delaySearch);
  }, [searchQuery, searchType]);

  // Handle search for movies or people
  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;

    setIsSearching(true);
    try {
      if (searchType === "movie") {
        // For movies, first search to get movie IDs
        const searchResponse = await axios.get(searchMovie(searchQuery));

        // Then filter the results client-side to remove future releases
        const currentDate = new Date();
        const filteredResults = searchResponse.data.results.filter((movie) => {
          if (!movie.release_date) return true;
          const releaseDate = new Date(movie.release_date);
          return releaseDate <= currentDate;
        });

        setSearchResults(filteredResults);
      } else {
        // For people, keep using the search/person endpoint
        const response = await axios.get(searchPerson(searchQuery));
        setSearchResults(response.data.results);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle selecting a movie
  const handleSelectMovie = (movie) => {
    if (selectedMovies.some((m) => m.id === movie.id)) {
      setSelectedMovies(selectedMovies.filter((m) => m.id !== movie.id));
    } else {
      setSelectedMovies([...selectedMovies, movie]);
    }
  };

  // Handle selecting a person
  const handleSelectPerson = (person) => {
    if (selectedPeople.some((p) => p.id === person.id)) {
      setSelectedPeople(selectedPeople.filter((p) => p.id !== person.id));
    } else {
      setSelectedPeople([...selectedPeople, person]);
    }
  };

  // Handle selecting a genre
  const handleSelectGenre = (genre) => {
    if (selectedGenres.some((g) => g.id === genre.id)) {
      setSelectedGenres(selectedGenres.filter((g) => g.id !== genre.id));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  // Handle rating a movie
  const handleRateMovie = (movie, score) => {
    setMovieRatings({
      ...movieRatings,
      [movie.id]: score,
    });
  };

  // Handle next step
  const handleNextStep = () => {
    setStep(step + 1);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Handle previous step
  const handlePrevStep = () => {
    setStep(step - 1);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Handle final submission
  const handleSubmit = async () => {
    try {
      // Initialize MyList document if not exists
      const myListRef = doc(db, "MyList", user.uid);
      const myListDoc = await getDoc(myListRef);
      const currentData = myListDoc.exists() ? myListDoc.data() : {};

      // Add movies to MyList with ratings if provided
      const currentMovies = currentData.movies || [];
      const moviesWithRatings = selectedMovies.map((movie) => {
        const userRating = {
          status: "Completed",
          dateAdded: new Date().toISOString(),
        };

        // Use provided rating or default to 10
        userRating.score = movieRatings[movie.id] || 10;

        return {
          ...movie,
          userRating,
        };
      });

      // Add people to MyList
      const currentPeople = currentData.people || [];
      const peopleWithDateAdded = selectedPeople.map((person) => ({
        ...person,
        dateAdded: new Date().toISOString(),
      }));

      // Update MyList with all preferences
      await setDoc(myListRef, {
        ...currentData,
        movies: [...currentMovies, ...moviesWithRatings],
        people: [...currentPeople, ...peopleWithDateAdded],
        preferredGenres: selectedGenres,
        lastUpdated: new Date().toISOString(),
      });

      // Add movies to InteractionList
      const interactionListRef = doc(db, "InteractionList", user.uid);
      const interactionDoc = await getDoc(interactionListRef);

      if (interactionDoc.exists()) {
        // Get existing movie IDs
        const existingData = interactionDoc.data();
        const existingMovieIds = existingData.movie_ids || [];

        // Get IDs of newly selected movies
        const newMovieIds = selectedMovies.map((movie) => movie.id);

        // Create a merged array of unique movie IDs
        const uniqueMovieIds = Array.from(
          new Set([...existingMovieIds, ...newMovieIds])
        );

        // Update the InteractionList
        await updateDoc(interactionListRef, {
          movie_ids: uniqueMovieIds,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        // Create a new InteractionList document
        const movieIds = selectedMovies.map((movie) => movie.id);
        await setDoc(interactionListRef, {
          movie_ids: movieIds,
          lastUpdated: new Date().toISOString(),
        });
      }

      onClose();
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  // Skip the preferences setup
  const handleSkip = () => {
    onClose();
  };

  // In UserPreferencesModal.jsx, add a getCurrentDate function
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 overflow-y-auto">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-5xl mx-auto my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            Welcome to CineWorld!
          </h2>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-300 mb-4">
            Let's personalize your experience! Tell us about your movie
            preferences to get recommendations tailored just for you.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            You can skip this step, but adding at least one preference will
            greatly improve your experience.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center mb-6">
          <div
            className={`w-3 h-3 rounded-full mx-1 ${
              step === 1 ? "bg-cineworldYellow" : "bg-gray-600"
            }`}
          ></div>
          <div
            className={`w-3 h-3 rounded-full mx-1 ${
              step === 2 ? "bg-cineworldYellow" : "bg-gray-600"
            }`}
          ></div>
          <div
            className={`w-3 h-3 rounded-full mx-1 ${
              step === 3 ? "bg-cineworldYellow" : "bg-gray-600"
            }`}
          ></div>
          <div
            className={`w-3 h-3 rounded-full mx-1 ${
              step === 4 ? "bg-cineworldYellow" : "bg-gray-600"
            }`}
          ></div>
        </div>

        {/* Step 1: Introduction */}
        {step === 1 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Let's Get Started
            </h3>
            <p className="text-gray-300 mb-4">
              In the next steps, you'll have the opportunity to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
              <li>Add movies you've watched or enjoyed</li>
              <li>
                Select your favorite actors, directors, or other film
                personalities
              </li>
              <li>Choose your preferred genres</li>
            </ul>
            <p className="text-gray-300 mb-4">
              This will help us personalize your experience and provide better
              recommendations.
            </p>
          </div>
        )}

        {/* Step 2: Movies */}
        {step === 2 && (
          <div className="mb-6 max-h-[60vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">
              Add Movies You've Watched
            </h3>

            <div className="flex mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for movies... (type at least 2 characters)"
                className="flex-grow bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              {isSearching && (
                <div className="ml-2 flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* Split layout: 2/3 for search results, 1/3 for selected items */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Results - 2/3 width */}
              <div className="md:w-2/3">
                {searchResults.length > 0 ? (
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">
                      Search Results
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[50vh]">
                      {searchResults.map((movie) => (
                        <div
                          key={movie.id}
                          className={`bg-gray-800 rounded p-2 cursor-pointer transition-all ${
                            selectedMovies.some((m) => m.id === movie.id)
                              ? "ring-2 ring-red-600"
                              : ""
                          }`}
                          onClick={() => handleSelectMovie(movie)}
                        >
                          {movie.poster_path ? (
                            <img
                              src={imageURL2 + movie.poster_path}
                              alt={movie.title}
                              className="w-full h-36 object-cover rounded mb-2"
                            />
                          ) : (
                            <div className="w-full h-36 bg-gray-700 rounded mb-2 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">
                                No Image
                              </span>
                            </div>
                          )}
                          <h5 className="text-white text-sm font-medium truncate">
                            {movie.title}
                          </h5>
                          <p className="text-gray-400 text-xs">
                            {movie.release_date
                              ? movie.release_date.substring(0, 4)
                              : "N/A"}
                          </p>
                          <div className="flex items-center mt-1">
                            <StarRating rating={movie.vote_average} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded p-4 text-center h-40 flex items-center justify-center">
                    <p className="text-gray-400">
                      {searchQuery.length < 2
                        ? "Type at least 2 characters to search"
                        : isSearching
                        ? "Searching..."
                        : "No results found. Try a different search term."}
                    </p>
                  </div>
                )}
              </div>

              {/* Selected Movies - 1/3 width */}
              <div className="md:w-1/3 bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-medium text-white mb-2 flex items-center">
                  <span className="mr-2">Your Selected Movies</span>
                  <span className="bg-cineworldYellow text-white text-xs px-2 py-1 rounded-full">
                    {selectedMovies.length}
                  </span>
                </h4>

                {selectedMovies.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>No movies selected yet.</p>
                    <p className="text-sm mt-2">
                      Search and click on movies to add them here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[45vh] space-y-3">
                    {selectedMovies.map((movie) => (
                      <div
                        key={movie.id}
                        className="bg-gray-700 rounded p-2 relative flex"
                      >
                        <button class="absolute top-1 right-1 bg-red-600 text-white text-sm rounded-full w-5 h-5 grid place-items-center leading-none">
                          ×
                        </button>

                        {movie.poster_path ? (
                          <img
                            src={imageURL2 + movie.poster_path}
                            alt={movie.title}
                            className="w-16 h-24 object-cover rounded mr-2 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-24 bg-gray-600 rounded mr-2 flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-400 text-xs">
                              No Image
                            </span>
                          </div>
                        )}

                        <div className="flex-grow">
                          <h5 className="text-white text-sm font-medium line-clamp-1">
                            {movie.title}
                          </h5>
                          <p className="text-gray-400 text-xs mb-1">
                            {movie.release_date
                              ? movie.release_date.substring(0, 4)
                              : "N/A"}
                          </p>

                          <div className="mt-1">
                            <label className="block text-white text-xs font-medium mb-1">
                              Your Rating:
                            </label>
                            <select
                              value={movieRatings[movie.id] || 10}
                              onChange={(e) =>
                                handleRateMovie(movie, Number(e.target.value))
                              }
                              className="w-full bg-gray-600 text-white rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-600"
                            >
                              <option value="1">(1) Appalling</option>
                              <option value="2">(2) Horrible</option>
                              <option value="3">(3) Very Bad</option>
                              <option value="4">(4) Bad</option>
                              <option value="5">(5) Average</option>
                              <option value="6">(6) Fine</option>
                              <option value="7">(7) Good</option>
                              <option value="8">(8) Very Good</option>
                              <option value="9">(9) Great</option>
                              <option value="10">(10) Masterpiece</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: People */}
        {step === 3 && (
          <div className="mb-6 max-h-[60vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">
              Add Your Favorite Actors, Directors, etc.
            </h3>

            <div className="flex mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchType("person");
                }}
                placeholder="Search for people... (type at least 2 characters)"
                className="flex-grow bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              {isSearching && (
                <div className="ml-2 flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* Split layout: 2/3 for search results, 1/3 for selected items */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Results - 2/3 width */}
              <div className="md:w-2/3">
                {searchResults.length > 0 ? (
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">
                      Search Results
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[50vh]">
                      {searchResults.map((person) => (
                        <div
                          key={person.id}
                          className={`bg-gray-800 rounded p-2 cursor-pointer transition-all ${
                            selectedPeople.some((p) => p.id === person.id)
                              ? "ring-2 ring-red-600"
                              : ""
                          }`}
                          onClick={() => handleSelectPerson(person)}
                        >
                          {person.profile_path ? (
                            <img
                              src={imageURL2 + person.profile_path}
                              alt={person.name}
                              className="w-full h-36 object-cover rounded mb-2"
                            />
                          ) : (
                            <div className="w-full h-36 bg-gray-700 rounded mb-2 flex items-center justify-center">
                              <img
                                src="/placeholder.jpg"
                                alt={person.name}
                                className="w-full h-full object-cover rounded"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <h5 className="text-white text-sm font-medium truncate">
                            {person.name}
                          </h5>
                          <p className="text-gray-400 text-xs truncate">
                            {person.known_for_department || "Actor/Actress"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded p-4 text-center h-40 flex items-center justify-center">
                    <p className="text-gray-400">
                      {searchQuery.length < 2
                        ? "Type at least 2 characters to search"
                        : isSearching
                        ? "Searching..."
                        : "No results found. Try a different search term."}
                    </p>
                  </div>
                )}
              </div>

              {/* Selected People - 1/3 width */}
              <div className="md:w-1/3 bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-medium text-white mb-2 flex items-center">
                  <span className="mr-2">Your Selected People</span>
                  <span className="bg-cineworldYellow text-white text-xs px-2 py-1 rounded-full">
                    {selectedPeople.length}
                  </span>
                </h4>

                {selectedPeople.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>No people selected yet.</p>
                    <p className="text-sm mt-2">
                      Search and click on people to add them here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[45vh] space-y-3">
                    {selectedPeople.map((person) => (
                      <div
                        key={person.id}
                        className="bg-gray-700 rounded p-2 relative flex"
                      >
                        <button class="absolute top-1 right-1 bg-red-600 text-white text-sm rounded-full w-5 h-5 grid place-items-center leading-none">
                          ×
                        </button>

                        {person.profile_path ? (
                          <img
                            src={imageURL2 + person.profile_path}
                            alt={person.name}
                            className="w-16 h-24 object-cover rounded mr-2 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-24 bg-gray-600 rounded mr-2 flex items-center justify-center flex-shrink-0">
                            <img
                              src="/placeholder.jpg"
                              alt={person.name}
                              className="w-full h-full object-cover rounded"
                              loading="lazy"
                            />
                          </div>
                        )}

                        <div className="flex-grow pt-2">
                          <h5 className="text-white text-sm font-medium line-clamp-1">
                            {person.name}
                          </h5>
                          <p className="text-gray-400 text-xs">
                            {person.known_for_department || "Actor/Actress"}
                          </p>
                          {person.known_for && person.known_for.length > 0 && (
                            <p className="text-gray-400 text-xs mt-1">
                              Known for:{" "}
                              {person.known_for[0].title ||
                                person.known_for[0].name ||
                                ""}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Genres */}
        {step === 4 && (
          <div className="mb-6 max-h-[60vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">
              Select Your Favorite Genres
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
              {genresList.map((genre) => (
                <div
                  key={genre.id}
                  onClick={() => handleSelectGenre(genre)}
                  className={`p-3 rounded cursor-pointer transition-all ${
                    selectedGenres.some((g) => g.id === genre.id)
                      ? "bg-cineworldYellow text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {genre.name}
                </div>
              ))}
            </div>

            {/* Selected Genres Summary */}
            {selectedGenres.length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg font-medium text-white mb-2">
                  Your Selected Genres
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedGenres.map((genre) => (
                    <div
                      key={genre.id}
                      className="bg-cineworldYellow text-white px-3 py-1 rounded-full flex items-center"
                    >
                      {genre.name}
                      <button
                        className="ml-2 text-white"
                        onClick={() => handleSelectGenre(genre)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <button
              onClick={handlePrevStep}
              className="px-4 py-2 text-white bg-gray-700 rounded hover:bg-gray-600 transition-colors"
            >
              Previous
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-white bg-gray-700 rounded hover:bg-gray-600 transition-colors"
            >
              Skip
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={handleNextStep}
              className="px-4 py-2 text-white bg-cineworldYellow rounded hover:bg-cineworldYellow transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-white bg-cineworldYellow rounded hover:bg-cineworldYellow transition-colors"
            >
              Save Preferences
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserPreferencesModal;
