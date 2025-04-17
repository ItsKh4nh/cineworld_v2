import React, { useState, useContext, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/FirebaseConfig";
import { AuthContext } from "../../contexts/UserContext";
import { imageUrlBackup, genresList } from "../../config/constants";
import useUpdateMyList from "../../hooks/useUpdateMyList";
import usePlayMovie from "../../hooks/usePlayMovie";
import useMoviePopup from "../../hooks/useMoviePopup";
import RatingModal from "../Modals/RatingModal";
import FilterModal from "../Modals/FilterModal";
import { ClipLoader } from "react-spinners";
import { toast } from "react-hot-toast";
import useGenresConverter from "../../hooks/useGenresConverter";
import axios from "../../axios";
import { API_KEY } from "../../config/constants";
import StarRating from "../StarRating/StarRating";
import { FaMinus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { slugify } from "../../utils";

// Icons
import ClearIcon from "../../assets/clear-icon.svg?react";
import StarPlaceholderIcon from "../../assets/star-placeholder-icon.svg?react";
import EditIcon from "../../assets/edit-icon.svg?react";
import RemoveIcon from "../../assets/remove-icon.svg?react";

function MyListTable() {
  const navigate = useNavigate();
  const { User } = useContext(AuthContext);
  const { removeFromMyList, updateMovieNote, PopupMessage, updateRatedMovie } =
    useUpdateMyList();
  const { playMovie } = usePlayMovie();
  const { handleMoviePopup } = useMoviePopup();
  const { convertGenre } = useGenresConverter();

  // State for movies and people lists
  const [myMovies, setMyMovies] = useState([]);
  const [myPeople, setMyPeople] = useState([]);
  const [allMovies, setAllMovies] = useState([]); // Store all movies for filtering
  const [loading, setLoading] = useState(true);

  // State for UI tabs and responsive design
  const [activeTab, setActiveTab] = useState("movies");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1200);

  // State for movie editing
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [editingRating, setEditingRating] = useState(null);

  // State for confirmation modal
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [movieToRemove, setMovieToRemove] = useState(null);

  // State for filtering and searching
  const [sortConfig, setSortConfig] = useState({
    key: "dateAdded",
    direction: "desc",
  });
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [peopleSearchTerm, setPeopleSearchTerm] = useState("");

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsLargeScreen(window.innerWidth >= 1200);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load initial data
  useEffect(() => {
    getMovies();
  }, []);

  // Extract available genres for filtering when movies are loaded
  useEffect(() => {
    if (myMovies.length > 0) {
      const allGenreIds = myMovies.flatMap((movie) => movie.genre_ids || []);
      const uniqueGenreIds = [...new Set(allGenreIds)];
      const genres = uniqueGenreIds
        .map((id) => {
          const genre = genresList.find((g) => g.id === id);
          return genre ? { id, name: genre.name } : null;
        })
        .filter(Boolean);

      setAvailableGenres(genres);
    }
  }, [myMovies]);

  // Fetch movies and people data from Firestore
  function getMovies() {
    setLoading(true);

    getDoc(doc(db, "MyList", User.uid))
      .then((result) => {
        const data = result.data();
        if (data && data.movies) {
          // Fetch additional details for each movie
          const moviesWithRuntime = data.movies.map(async (movie) => {
            try {
              const response = await axios.get(
                `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&language=en-US`
              );
              return {
                ...movie,
                runtime: response.data.runtime,
                release_date_full: response.data.release_date,
              };
            } catch (error) {
              console.error("Error fetching movie details:", error);
              return movie;
            }
          });

          Promise.all(moviesWithRuntime).then((updatedMovies) => {
            setMyMovies(updatedMovies);
            setAllMovies(updatedMovies);
          });

          // Set people data if available
          if (data.people) {
            setMyPeople(data.people || []);
          } else {
            setMyPeople([]);
          }
        } else {
          setMyMovies([]);
          setAllMovies([]);
          setMyPeople([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setMyMovies([]);
        setAllMovies([]);
        setMyPeople([]);
        setLoading(false);
      });
  }

  // Note editing handlers
  const handleEditNote = (movie) => {
    setEditingNote(movie.id);
    setNoteText(movie.userRating?.note || "");
  };

  const handleSaveNote = async (movie) => {
    const success = await updateMovieNote(movie, noteText);

    if (success) {
      setEditingNote(null);
      setTimeout(() => {
        getMovies();
      }, 1000);
    }
  };

  // Movie removal handlers
  const handleRemoveMovie = (movie) => {
    setMovieToRemove(movie);
    setShowConfirmation(true);
  };

  const confirmRemove = async () => {
    if (movieToRemove) {
      const success = await removeFromMyList(movieToRemove);
      setShowConfirmation(false);
      setMovieToRemove(null);

      if (success) {
        setTimeout(() => {
          getMovies();
        }, 1000);
      }
    }
  };

  const cancelRemove = () => {
    setShowConfirmation(false);
    setMovieToRemove(null);
  };

  // Rating handlers
  const handleEditRating = (movie) => {
    setEditingRating(movie);
  };

  const handleSaveRating = async (updatedMovie) => {
    const success = await updateRatedMovie(editingRating, updatedMovie);

    if (success) {
      setEditingRating(null);
      setTimeout(() => {
        getMovies();
      }, 1000);
    }
  };

  // Person removal handler
  const handleRemovePerson = async (person) => {
    try {
      const userDocRef = doc(db, "MyList", User.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const people = userData.people || [];
        const updatedPeople = people.filter((p) => p.id !== person.id);

        await updateDoc(userDocRef, {
          people: updatedPeople,
          lastUpdated: new Date().toISOString(),
        });

        setMyPeople((prevPeople) =>
          prevPeople.filter((p) => p.id !== person.id)
        );

        toast.success("Person removed from your list");
      }
    } catch (error) {
      console.error("Error removing person:", error);
      toast.error("Failed to remove person from your list");
    }
  };

  // Filtering and sorting handlers
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleOpenFilterModal = () => {
    setShowFilterModal(true);
  };

  const handleCloseFilterModal = () => {
    setShowFilterModal(false);
  };

  const handleApplyStatusFilter = (status) => {
    if (status === "All") {
      setMyMovies(allMovies);
    } else {
      const filtered = allMovies.filter(
        (movie) => movie.userRating?.status === status
      );
      setMyMovies(filtered);
    }
  };

  const handleResetFilters = () => {
    setSelectedGenres([]);
    setMyMovies(allMovies);
  };

  // Utility formatting functions
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Unknown";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return "Unknown";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  // Apply sorted movies with filters
  const sortedMovies = React.useMemo(() => {
    let sortableMovies = [...myMovies];

    // Apply genre filter if any genres are selected
    if (selectedGenres.length > 0) {
      sortableMovies = sortableMovies.filter((movie) => {
        return (
          movie.genre_ids &&
          selectedGenres.every((genreId) => movie.genre_ids.includes(genreId))
        );
      });
    }

    if (sortConfig.key) {
      sortableMovies.sort((a, b) => {
        // Handle date fields
        if (
          sortConfig.key === "release_date_full" ||
          sortConfig.key === "release_date" ||
          sortConfig.key === "first_air_date"
        ) {
          const dateA = a[sortConfig.key]
            ? new Date(a[sortConfig.key])
            : new Date(0);
          const dateB = b[sortConfig.key]
            ? new Date(b[sortConfig.key])
            : new Date(0);

          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }

        // Handle nested rating date property
        if (sortConfig.key === "userRating.dateAdded") {
          const dateA = a.userRating?.dateAdded
            ? new Date(a.userRating.dateAdded)
            : new Date(0);
          const dateB = b.userRating?.dateAdded
            ? new Date(b.userRating.dateAdded)
            : new Date(0);

          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }

        // Handle nested rating properties
        if (sortConfig.key.includes(".")) {
          const [parent, child] = sortConfig.key.split(".");

          if (!a[parent] && !b[parent]) return 0;
          if (!a[parent]) return sortConfig.direction === "asc" ? -1 : 1;
          if (!b[parent]) return sortConfig.direction === "asc" ? 1 : -1;

          // Special handling for score property
          if (child === "score") {
            const scoreA =
              a[parent][child] !== undefined ? a[parent][child] : -1;
            const scoreB =
              b[parent][child] !== undefined ? b[parent][child] : -1;

            if (scoreA < scoreB) {
              return sortConfig.direction === "asc" ? -1 : 1;
            }
            if (scoreA > scoreB) {
              return sortConfig.direction === "asc" ? 1 : -1;
            }
            return 0;
          }

          // Handle other nested properties
          if (a[parent][child] === undefined && b[parent][child] === undefined)
            return 0;
          if (a[parent][child] === undefined)
            return sortConfig.direction === "asc" ? -1 : 1;
          if (b[parent][child] === undefined)
            return sortConfig.direction === "asc" ? 1 : -1;

          if (a[parent][child] < b[parent][child]) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (a[parent][child] > b[parent][child]) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        }

        // Handle direct properties
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableMovies;
  }, [myMovies, sortConfig, selectedGenres]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#ff0000" size={60} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {PopupMessage}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-70"></div>
          <div className="relative z-50 bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-xl font-medium text-white mb-4">
              Confirm Removal
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to remove "
              {movieToRemove?.title || movieToRemove?.name}" from your list?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelRemove}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={handleCloseFilterModal}
        availableGenres={availableGenres}
        selectedGenres={selectedGenres}
        setSelectedGenres={setSelectedGenres}
        onApplyStatusFilter={handleApplyStatusFilter}
        onResetFilters={handleResetFilters}
      />

      {/* Rating Modal */}
      {editingRating && (
        <RatingModal
          movie={editingRating}
          onClose={() => setEditingRating(null)}
          onSave={handleSaveRating}
        />
      )}

      {/* Tab Selector - Added mt-16 to create more space from navbar */}
      <div className="flex mb-6 border-b border-gray-700 mt-16">
        <button
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === "movies"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("movies")}
        >
          Movies
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === "people"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("people")}
        >
          People
        </button>
      </div>

      {/* Movies Tab */}
      {activeTab === "movies" && (
        <>
          {/* Search, Filter and Sort Controls */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search movies..."
                className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-red-600"
                value={searchTerm}
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  setSearchTerm(searchTerm);

                  if (searchTerm === "") {
                    setMyMovies(allMovies); // Reset to original list
                  } else {
                    const filtered = allMovies.filter(
                      (movie) =>
                        (movie.title || movie.name)
                          .toLowerCase()
                          .includes(searchTerm) ||
                        (movie.userRating?.note || "")
                          .toLowerCase()
                          .includes(searchTerm)
                    );
                    setMyMovies(filtered);
                  }
                }}
              />
              <button
                onClick={() => {
                  setSearchTerm("");
                  setMyMovies(allMovies); // Reset to original list
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600 hover:text-red-500 focus:outline-none"
                aria-label="Clear search"
              >
                <ClearIcon className="h-6 w-6" />
              </button>
            </div>
            <div>
              <button
                onClick={handleOpenFilterModal}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full md:w-auto"
              >
                Filters{" "}
                {selectedGenres.length > 0 ? `(${selectedGenres.length})` : ""}
              </button>
            </div>
          </div>

          {myMovies.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xl text-gray-400">
                Your movie list is empty. Add some movies to get started!
              </p>
            </div>
          ) : (
            <>
              {/* Desktop View */}
              {!isMobile && (
                <div className="overflow-x-auto hidden md:block">
                  <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          #
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("title")}
                        >
                          Title {getSortIcon("title")}
                        </th>
                        {isLargeScreen && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Genres
                          </th>
                        )}
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("release_date_full")}
                        >
                          Release Date {getSortIcon("release_date_full")}
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("runtime")}
                        >
                          Runtime {getSortIcon("runtime")}
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("userRating.score")}
                        >
                          Score {getSortIcon("userRating.score")}
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("userRating.status")}
                        >
                          Status {getSortIcon("userRating.status")}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Notes
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {sortedMovies.map((movie, index) => (
                        <tr key={movie.id} className="hover:bg-gray-800">
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                            {index + 1}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <img
                                src={
                                  imageUrlBackup +
                                  (movie.poster_path || movie.backdrop_path)
                                }
                                alt={movie.title || movie.name}
                                className="h-20 w-14 object-cover rounded mr-4"
                              />
                              <div>
                                <div
                                  className="text-sm font-medium text-white cursor-pointer hover:text-blue-400"
                                  onClick={() => handleMoviePopup(movie)}
                                >
                                  {movie.title || movie.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          {isLargeScreen && (
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                              <div className="text-sm text-gray-300 mt-1">
                                {movie.genre_ids
                                  ? convertGenre(movie.genre_ids).join(", ")
                                  : "N/A"}
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatDate(
                              movie.release_date_full ||
                                movie.release_date ||
                                movie.first_air_date
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatRuntime(movie.runtime)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {movie.userRating?.score ? (
                              <StarRating rating={movie.userRating.score} />
                            ) : (
                              <StarPlaceholderIcon
                                className="w-5 h-5"
                                aria-hidden="true"
                              />
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                            {movie.userRating?.status || "Not set"}
                          </td>
                          <td className="px-4 py-4">
                            {editingNote === movie.id ? (
                              <div>
                                <textarea
                                  value={noteText}
                                  onChange={(e) => setNoteText(e.target.value)}
                                  className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                                  rows="2"
                                ></textarea>
                                <div className="flex mt-1">
                                  <button
                                    onClick={() => handleSaveNote(movie)}
                                    className="text-xs bg-green-700 text-white px-2 py-1 rounded mr-1"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingNote(null)}
                                    className="text-xs bg-gray-600 text-white px-2 py-1 rounded"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm text-gray-300 line-clamp-2">
                                  {movie.userRating?.note || "No notes"}
                                </p>
                                <button
                                  onClick={() => handleEditNote(movie)}
                                  className="text-xs text-blue-400 mt-1"
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-4">
                              <button
                                onClick={() => handleEditRating(movie)}
                                className="text-yellow-400 hover:text-yellow-300"
                                title="Edit Rating"
                              >
                                <EditIcon className="h-8 w-8" />
                              </button>
                              <button
                                onClick={() => handleRemoveMovie(movie)}
                                className="text-red-400 hover:text-red-300"
                                title="Remove"
                              >
                                <RemoveIcon className="h-8 w-8" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Mobile View */}
              {isMobile && (
                <div className="md:hidden">
                  {sortedMovies.map((movie, index) => (
                    <div
                      key={movie.id}
                      className="flex border-b border-gray-800 py-4"
                    >
                      <div className="text-gray-400 mr-3 font-medium">
                        {index + 1}
                      </div>
                      <div className="w-16 flex-shrink-0 mr-3">
                        <img
                          src={
                            imageUrlBackup +
                            (movie.poster_path || movie.backdrop_path)
                          }
                          alt={movie.title || movie.name}
                          className="w-full h-24 object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <div
                          className="text-white font-medium cursor-pointer hover:text-blue-400"
                          onClick={() => handleMoviePopup(movie)}
                        >
                          {movie.title || movie.name}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          {formatDate(
                            movie.release_date_full ||
                              movie.release_date ||
                              movie.first_air_date
                          )}
                        </div>
                        <div className="text-sm text-gray-300 mt-1">
                          {movie.genre_ids
                            ? convertGenre(movie.genre_ids).join(", ")
                            : "N/A"}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            <div className="mr-3">
                              {movie.userRating?.score ? (
                                <StarRating
                                  rating={movie.userRating.score}
                                  size="small"
                                />
                              ) : (
                                <StarPlaceholderIcon
                                  className="w-5 h-5"
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              {movie.userRating?.status || "N/A"}
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEditRating(movie)}
                              className="text-yellow-400 hover:text-yellow-300"
                              title="Edit Rating"
                            >
                              <EditIcon className="h-6 w-6" />
                            </button>
                            <button
                              onClick={() => handleRemoveMovie(movie)}
                              className="text-red-400 hover:text-red-300"
                              title="Remove"
                            >
                              <RemoveIcon className="h-6 w-6" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* People Tab */}
      {activeTab === "people" && (
        <>
          {/* Search for people */}
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="Search people..."
              className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-red-600"
              value={peopleSearchTerm}
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                setPeopleSearchTerm(searchTerm);

                // Implement search functionality for people
                if (searchTerm === "") {
                  // Just reset people to original list without reloading everything
                  const docRef = doc(db, "MyList", User.uid);
                  getDoc(docRef).then((result) => {
                    const data = result.data();
                    if (data && data.people) {
                      setMyPeople(data.people || []);
                    }
                  });
                } else {
                  const filtered = myPeople.filter(
                    (person) =>
                      person.name.toLowerCase().includes(searchTerm) ||
                      (person.known_for_department || "")
                        .toLowerCase()
                        .includes(searchTerm)
                  );
                  setMyPeople(filtered);
                }
              }}
            />
            <button
              onClick={() => {
                setPeopleSearchTerm("");
                // Just reset people to original list without reloading everything
                const docRef = doc(db, "MyList", User.uid);
                getDoc(docRef).then((result) => {
                  const data = result.data();
                  if (data && data.people) {
                    setMyPeople(data.people || []);
                  }
                });
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600 hover:text-red-500 focus:outline-none"
              aria-label="Clear search"
            >
              <ClearIcon className="h-6 w-6" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <ClipLoader color="#E50914" size={60} />
            </div>
          ) : myPeople.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xl text-gray-400">
                You haven't added any people to your list yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
              {myPeople.map((person) => (
                <div
                  key={person.id}
                  className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div
                    className="relative cursor-pointer"
                    onClick={() => navigate(`/people/${person.id}-${slugify(person.name)}`)}
                  >
                    <img
                      src={
                        person.profile_path
                          ? `${imageUrlBackup}${person.profile_path}`
                          : "/placeholder.jpg"
                      }
                      alt={person.name}
                      className="w-full aspect-[2/3] object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="text-white text-lg font-bold line-clamp-1">
                      {person.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">
                      {person.known_for_department}
                    </p>

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleRemovePerson(person)}
                        className="bg-red-600 hover:bg-transparent hover:text-red-600 hover:border-red-600 border border-transparent text-white font-medium px-3 py-1 rounded-md transition duration-300 ease-in-out flex items-center justify-center text-sm"
                      >
                        <FaMinus className="mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MyListTable;
