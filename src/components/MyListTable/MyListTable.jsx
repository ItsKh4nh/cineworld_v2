import React, { useState, useContext, useEffect, useRef } from "react";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "../../firebase/FirebaseConfig";
import { AuthContext } from "../../contexts/UserContext";
import { imageURL2, genresList } from "../../config/constants";
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

function MyListTable() {
  const { User } = useContext(AuthContext);
  const { removeFromMyList, updateMovieNote, PopupMessage, addRatedMovieToList, updateRatedMovie } = useUpdateMyList();
  const { playMovie } = usePlayMovie();
  const { handleMoviePopup } = useMoviePopup();
  const { convertGenre } = useGenresConverter();
  
  const [myMovies, setMyMovies] = useState([]);
  const [myPeople, setMyPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'dateAdded', direction: 'desc' });
  const [editingRating, setEditingRating] = useState(null);
  const [activeTab, setActiveTab] = useState("movies");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [movieToRemove, setMovieToRemove] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [allMovies, setAllMovies] = useState([]); // Store all movies for filtering
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Add states to track screen size
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1200);

  // Update event listener for window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsLargeScreen(window.innerWidth >= 1200);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    getMovies();
  }, []);

  useEffect(() => {
    if (myMovies.length > 0) {
      // Extract all genre IDs from movies
      const allGenreIds = myMovies.flatMap(movie => movie.genre_ids || []);
      // Get unique genre IDs
      const uniqueGenreIds = [...new Set(allGenreIds)];
      // Map to genre names using the genresList from constants
      const genres = uniqueGenreIds.map(id => {
        const genre = genresList.find(g => g.id === id);
        return genre ? { id, name: genre.name } : null;
      }).filter(Boolean);
      
      setAvailableGenres(genres);
    }
  }, [myMovies]);

  function getMovies() {
    setLoading(true);
    getDoc(doc(db, "MyList", User.uid)).then((result) => {
      const data = result.data();
      if (data) {
        if (data.movies) {
          // Get runtime for each movie
          const moviesWithRuntime = data.movies.map(async (movie) => {
            try {
              // Use the project's axios instance with baseURL already configured
              const response = await axios.get(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&language=en-US`);
              return {
                ...movie,
                runtime: response.data.runtime,
                release_date_full: response.data.release_date
              };
            } catch (error) {
              console.error("Error fetching movie details:", error);
              return movie;
            }
          });
          
          // Wait for all promises to resolve
          Promise.all(moviesWithRuntime).then(updatedMovies => {
            setMyMovies(updatedMovies);
            setAllMovies(updatedMovies); // Store all movies for filtering
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
        
        if (data.people) {
          setMyPeople(data.people || []);
        }
      } else {
        setLoading(false);
      }
    }).catch(error => {
      console.error("Error fetching data:", error);
      setLoading(false);
    });
  }

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedMovies = React.useMemo(() => {
    let sortableMovies = [...myMovies];
    
    // First apply genre filter if any genres are selected
    if (selectedGenres.length > 0) {
      sortableMovies = sortableMovies.filter(movie => {
        // Check if movie has ALL of the selected genres (AND logic)
        return movie.genre_ids && selectedGenres.every(genreId => 
          movie.genre_ids.includes(genreId)
        );
      });
    }
    
    if (sortConfig.key) {
      sortableMovies.sort((a, b) => {
        // Special handling for date fields
        if (sortConfig.key === 'release_date_full' || sortConfig.key === 'release_date' || sortConfig.key === 'first_air_date') {
          const dateA = a[sortConfig.key] ? new Date(a[sortConfig.key]) : new Date(0);
          const dateB = b[sortConfig.key] ? new Date(b[sortConfig.key]) : new Date(0);
          
          return sortConfig.direction === 'asc' 
            ? dateA - dateB 
            : dateB - dateA;
        }
        
        // Special handling for userRating.dateAdded
        if (sortConfig.key === 'userRating.dateAdded') {
          const dateA = a.userRating?.dateAdded ? new Date(a.userRating.dateAdded) : new Date(0);
          const dateB = b.userRating?.dateAdded ? new Date(b.userRating.dateAdded) : new Date(0);
          
          return sortConfig.direction === 'asc' 
            ? dateA - dateB 
            : dateB - dateA;
        }
        
        // Handle nested properties for userRating
        if (sortConfig.key.includes('.')) {
          const [parent, child] = sortConfig.key.split('.');
          
          // Handle the case where one or both movies don't have the parent property
          if (!a[parent] && !b[parent]) return 0;
          if (!a[parent]) return sortConfig.direction === 'asc' ? -1 : 1;
          if (!b[parent]) return sortConfig.direction === 'asc' ? 1 : -1;
          
          // Handle the case where one or both movies don't have the child property
          if (child === 'score') {
            const scoreA = a[parent][child] !== undefined ? a[parent][child] : -1;
            const scoreB = b[parent][child] !== undefined ? b[parent][child] : -1;
            
            if (scoreA < scoreB) {
              return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (scoreA > scoreB) {
              return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
          }
          
          // For other properties
          if (a[parent][child] === undefined && b[parent][child] === undefined) return 0;
          if (a[parent][child] === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
          if (b[parent][child] === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
          
          if (a[parent][child] < b[parent][child]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[parent][child] > b[parent][child]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
        
        // Handle direct properties
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableMovies;
  }, [myMovies, sortConfig, selectedGenres]);

  const handleEditNote = (movie) => {
    setEditingNote(movie.id);
    setNoteText(movie.userRating?.note || "");
  };

  const handleSaveNote = async (movie) => {
    const success = await updateMovieNote(movie, noteText);
    
    if (success) {
      setEditingNote(null);
      
      // Refresh the list after a short delay to show the updated data
      setTimeout(() => {
        getMovies();
      }, 1000);
    }
  };

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
        // Refresh the list after a short delay to allow the update to complete
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

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Unknown";
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const handleEditRating = (movie) => {
    setEditingRating(movie);
  };

  const handleSaveRating = async (updatedMovie) => {
    // Use the new updateRatedMovie function to properly update the movie
    const success = await updateRatedMovie(editingRating, updatedMovie);
    
    if (success) {
      setEditingRating(null);
      
      // Refresh the list after a short delay to show the updated data
      setTimeout(() => {
        getMovies();
      }, 1000);
    }
  };

  const handleRemovePerson = async (person) => {
    // Get the current user's document
    const userDocRef = doc(db, "MyList", User.uid);
    
    try {
      // Get the current list
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const currentPeople = userData.people || [];
        
        // Filter out the person to remove by ID
        const filteredPeople = currentPeople.filter(p => p.id !== person.id);
        
        // Update the document with the filtered list
        await updateDoc(userDocRef, { people: filteredPeople });
        
        // Update the local state
        setMyPeople(myPeople.filter(p => p.id !== person.id));
        toast.success(`${person.name} removed from your list`);
      }
    } catch (error) {
      console.error("Error removing person:", error);
      toast.error("Failed to remove person from your list");
    }
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
      const filtered = allMovies.filter(movie => 
        movie.userRating?.status === status
      );
      setMyMovies(filtered);
    }
  };

  const handleResetFilters = () => {
    setSelectedGenres([]);
    setMyMovies(allMovies);
  };

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
            <h3 className="text-xl font-medium text-white mb-4">Confirm Removal</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to remove "{movieToRemove?.title || movieToRemove?.name}" from your list?
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
      
      {/* Add Search, Filter and Sort Controls */}
      {activeTab === "movies" && (
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search movies..."
              className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-red-600"
              onChange={(e) => {
                // Implement search functionality
                const searchTerm = e.target.value.toLowerCase();
                if (searchTerm === '') {
                  setMyMovies(allMovies); // Reset to original list
                } else {
                  const filtered = allMovies.filter(movie => 
                    (movie.title || movie.name).toLowerCase().includes(searchTerm) ||
                    (movie.userRating?.note || '').toLowerCase().includes(searchTerm)
                  );
                  setMyMovies(filtered);
                }
              }}
            />
          </div>
          <div>
            <button
              onClick={handleOpenFilterModal}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full md:w-auto"
            >
              Filters {selectedGenres.length > 0 ? `(${selectedGenres.length})` : ''}
            </button>
          </div>
        </div>
      )}
      
      {activeTab === "people" && (
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search people..."
              className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-red-600"
              onChange={(e) => {
                // Implement search functionality for people
                const searchTerm = e.target.value.toLowerCase();
                if (searchTerm === '') {
                  getMovies(); // Reset to original list
                } else {
                  const filtered = myPeople.filter(person => 
                    person.name.toLowerCase().includes(searchTerm) ||
                    (person.known_for_department || '').toLowerCase().includes(searchTerm)
                  );
                  setMyPeople(filtered);
                }
              }}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-red-600"
              onChange={(e) => {
                // Implement sort for people
                const sortBy = e.target.value;
                let sortedPeople = [...myPeople];
                
                if (sortBy === 'name:asc') {
                  sortedPeople.sort((a, b) => a.name.localeCompare(b.name));
                } else if (sortBy === 'name:desc') {
                  sortedPeople.sort((a, b) => b.name.localeCompare(a.name));
                } else if (sortBy === 'dateAdded:desc') {
                  sortedPeople.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                } else if (sortBy === 'dateAdded:asc') {
                  sortedPeople.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
                }
                
                setMyPeople(sortedPeople);
              }}
            >
              <option value="name:asc">Name (A-Z)</option>
              <option value="name:desc">Name (Z-A)</option>
              <option value="dateAdded:desc">Date Added (Newest)</option>
              <option value="dateAdded:asc">Date Added (Oldest)</option>
            </select>
          </div>
        </div>
      )}
      
      {/* Movies Tab */}
      {activeTab === "movies" && (
        <>
          {myMovies.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xl text-gray-400">Your movie list is empty. Add some movies to get started!</p>
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" 
                            onClick={() => handleSort('title')}>
                          Title {getSortIcon('title')}
                        </th>
                        {isLargeScreen && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Genres
                          </th>
                        )}
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('release_date_full')}>
                          Release Date {getSortIcon('release_date_full')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('runtime')}>
                          Runtime {getSortIcon('runtime')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('userRating.score')}>
                          Score {getSortIcon('userRating.score')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('userRating.status')}>
                          Status {getSortIcon('userRating.status')}
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
                                src={imageURL2 + (movie.poster_path || movie.backdrop_path)} 
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
                              <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                                {movie.genre_ids ? convertGenre(movie.genre_ids).map((genre, idx) => (
                                  <span key={idx} className="flex items-center">
                                    {idx > 0 && <span className="mx-1 text-gray-600">•</span>}
                                    {genre}
                                  </span>
                                )) : "N/A"}
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatDate(movie.release_date_full || movie.release_date || movie.first_air_date)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatRuntime(movie.runtime)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {movie.userRating?.score ? (
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24" 
                                fill={
                                  movie.userRating.score <= 3 ? "#ff4545" : // Red
                                  movie.userRating.score <= 6 ? "#ffa534" : // Orange
                                  "#57e32c" // Green
                                }
                                className="w-5 h-5"
                                aria-hidden="true"
                              >
                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24" 
                                fill="#6b7280"
                                className="w-5 h-5"
                                aria-hidden="true"
                              >
                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                              </svg>
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
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleRemoveMovie(movie)}
                                className="text-red-400 hover:text-red-300"
                                title="Remove"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
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
                    <div key={movie.id} className="flex border-b border-gray-800 py-4">
                      <div className="text-gray-400 mr-3 font-medium">
                        {index + 1}
                      </div>
                      <div className="w-16 flex-shrink-0 mr-3">
                        <img
                          src={imageURL2 + (movie.poster_path || movie.backdrop_path)} 
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
                          {formatDate(movie.release_date_full || movie.release_date || movie.first_air_date)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                          {movie.genre_ids ? convertGenre(movie.genre_ids).map((genre, idx) => (
                            <span key={idx} className="flex items-center">
                              {idx > 0 && <span className="mx-1 text-gray-600">•</span>}
                              {genre}
                            </span>
                          )) : "N/A"}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            <div className="mr-3">
                              {movie.userRating?.score ? (
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  viewBox="0 0 24 24" 
                                  fill={
                                    movie.userRating.score <= 3 ? "#ff4545" : // Red
                                    movie.userRating.score <= 6 ? "#ffa534" : // Orange
                                    "#57e32c" // Green
                                  }
                                  className="w-5 h-5"
                                  aria-hidden="true"
                                >
                                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  viewBox="0 0 24 24" 
                                  fill="#6b7280"
                                  className="w-5 h-5"
                                  aria-hidden="true"
                                >
                                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
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
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleRemoveMovie(movie)}
                              className="text-red-400 hover:text-red-300"
                              title="Remove"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
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
          {myPeople.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xl text-gray-400">Your people list is empty. Add some actors, directors, or other film personalities to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {myPeople.map((person) => (
                <div key={person.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                  {person.profile_path ? (
                    <img 
                      src={imageURL2 + person.profile_path} 
                      alt={person.name}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-white text-xl font-semibold mb-1">{person.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{person.known_for_department || "Actor/Actress"}</p>
                    <p className="text-gray-400 text-xs mb-4">
                      Added on {formatDate(person.dateAdded)}
                    </p>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => window.open(`https://www.themoviedb.org/person/${person.id}`, '_blank')}
                        className="text-white bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleRemovePerson(person)}
                        className="text-white bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-sm"
                      >
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