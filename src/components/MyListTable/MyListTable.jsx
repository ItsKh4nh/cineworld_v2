import React, { useState, useContext, useEffect } from "react";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "../../firebase/FirebaseConfig";
import { AuthContext } from "../../contexts/UserContext";
import { imageURL2 } from "../../config/constants";
import useUpdateMyList from "../../hooks/useUpdateMyList";
import usePlayMovie from "../../hooks/usePlayMovie";
import useMoviePopup from "../../hooks/useMoviePopup";
import RatingModal from "../Modals/RatingModal";
import { ClipLoader } from "react-spinners";
import { toast } from "react-hot-toast";
import useGenresConverter from "../../hooks/useGenresConverter";

function MyListTable() {
  const { User } = useContext(AuthContext);
  const { removeFromMyList, updateMovieNote, PopupMessage } = useUpdateMyList();
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

  // Get a reference to the updateDoc function from Firebase
  const { addRatedMovieToList } = useUpdateMyList();

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

  function getMovies() {
    setLoading(true);
    getDoc(doc(db, "MyList", User.uid)).then((result) => {
      const data = result.data();
      if (data) {
        if (data.movies) {
          setMyMovies(data.movies);
        }
        if (data.people) {
          setMyPeople(data.people || []);
        }
      }
      setLoading(false);
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
    if (sortConfig.key) {
      sortableMovies.sort((a, b) => {
        // Handle nested properties for userRating
        if (sortConfig.key.includes('.')) {
          const [parent, child] = sortConfig.key.split('.');
          
          // Handle the case where one or both movies don't have the parent property
          if (!a[parent] && !b[parent]) return 0;
          if (!a[parent]) return sortConfig.direction === 'asc' ? -1 : 1;
          if (!b[parent]) return sortConfig.direction === 'asc' ? 1 : -1;
          
          // Handle the case where one or both movies don't have the child property
          // This is especially important for score which might be undefined for 'Plan to Watch' movies
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
  }, [myMovies, sortConfig]);

  const handleEditNote = (movie) => {
    setEditingNote(movie.id);
    setNoteText(movie.userRating?.note || "");
  };

  const handleSaveNote = (movie) => {
    updateMovieNote(movie, noteText);
    setEditingNote(null);
    // Refresh the list after a short delay to allow the update to complete
    setTimeout(() => {
      getMovies();
    }, 500);
  };

  const handleRemoveMovie = (movie) => {
    setMovieToRemove(movie);
    setShowConfirmation(true);
  };

  const confirmRemove = () => {
    if (movieToRemove) {
      removeFromMyList(movieToRemove);
      // Refresh the list after a short delay
      setTimeout(() => {
        getMovies();
      }, 500);
      setShowConfirmation(false);
      setMovieToRemove(null);
    }
  };

  const cancelRemove = () => {
    setShowConfirmation(false);
    setMovieToRemove(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const handleEditRating = (movie) => {
    setEditingRating(movie);
  };

  const handleSaveRating = (updatedMovie) => {
    // First remove the old movie
    removeFromMyList(editingRating);
    
    // Then add the updated movie
    setTimeout(() => {
      // Add the updated movie to the list
      addRatedMovieToList(updatedMovie);
      
      // Refresh the list and close the modal
      setEditingRating(null);
      getMovies();
    }, 500);
  };

  // Handle removing a person
  const handleRemovePerson = (person) => {
    // Remove the person from Firestore
    updateDoc(doc(db, "MyList", User.uid), {
      people: arrayRemove(person)
    })
      .then(() => {
        toast.success(" Person removed from MyList  ");
        // Refresh the list after a short delay
        setTimeout(() => {
          getMovies();
        }, 500);
      })
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
      });
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
      
      {/* Tab Selector */}
      <div className="flex mb-6 border-b border-gray-700">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "movies"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("movies")}
        >
          Movies
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
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
                            onClick={() => handleSort('userRating.score')}>
                          Score {getSortIcon('userRating.score')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('userRating.status')}>
                          Status {getSortIcon('userRating.status')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('userRating.dateAdded')}>
                          Date Added {getSortIcon('userRating.dateAdded')}
                        </th>
                        {isLargeScreen && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Note
                          </th>
                        )}
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
                                <div className="text-sm text-gray-400">
                                  {movie.release_date?.substring(0, 4) || 
                                  movie.first_air_date?.substring(0, 4) || "N/A"}
                                </div>
                                {!isLargeScreen && (
                                  <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                                    {movie.genre_ids ? convertGenre(movie.genre_ids).join(', ') : "N/A"}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          {isLargeScreen && (
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                              {movie.genre_ids ? convertGenre(movie.genre_ids).join(', ') : "N/A"}
                            </td>
                          )}
                          <td className="px-4 py-4 whitespace-nowrap">
                            {movie.userRating?.score ? (
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${movie.userRating.score >= 7 ? 'bg-green-800 text-green-100' : 
                                  movie.userRating.score >= 4 ? 'bg-yellow-800 text-yellow-100' : 
                                  'bg-red-800 text-red-100'}`}>
                                {movie.userRating.score}
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-700 text-gray-300">
                                N/A
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                            {movie.userRating?.status || "N/A"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatDate(movie.userRating?.dateAdded)}
                          </td>
                          {isLargeScreen && (
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
                          )}
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

              {/* Mobile View - MyAnimeList style */}
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
                          {movie.release_date?.substring(0, 4) || movie.first_air_date?.substring(0, 4) || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {movie.genre_ids ? convertGenre(movie.genre_ids).join(', ') : "N/A"}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            <div className="mr-3">
                              {movie.userRating?.score ? (
                                <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full 
                                  ${movie.userRating.score >= 7 ? 'bg-green-800 text-green-100' : 
                                    movie.userRating.score >= 4 ? 'bg-yellow-800 text-yellow-100' : 
                                    'bg-red-800 text-red-100'}`}>
                                  {movie.userRating.score}
                                </span>
                              ) : (
                                <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-gray-700 text-gray-300">
                                  N/A
                                </span>
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

      {editingRating && (
        <RatingModal
          movie={editingRating}
          onClose={() => setEditingRating(null)}
          onSave={handleSaveRating}
        />
      )}
    </div>
  );
}

export default MyListTable; 