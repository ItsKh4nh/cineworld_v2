import React, { useState, useContext, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/FirebaseConfig";
import { AuthContext } from "../../contexts/UserContext";
import { imageURL2 } from "../../config/constants";
import useUpdateMyList from "../../hooks/useUpdateMyList";
import usePlayMovie from "../../hooks/usePlayMovie";
import RatingModal from "../Modals/RatingModal";
import { ClipLoader } from "react-spinners";

function MyListTable() {
  const { User } = useContext(AuthContext);
  const { removeFromMyList, updateMovieNote, PopupMessage } = useUpdateMyList();
  const { playMovie } = usePlayMovie();
  
  const [myMovies, setMyMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'dateAdded', direction: 'desc' });

  useEffect(() => {
    getMovies();
  }, []);

  function getMovies() {
    setLoading(true);
    getDoc(doc(db, "MyList", User.uid)).then((result) => {
      const mv = result.data();
      if (mv && mv.movies) {
        setMyMovies(mv.movies);
      }
      setLoading(false);
    }).catch(error => {
      console.error("Error fetching movies:", error);
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
          if (!a[parent] || !b[parent]) return 0;
          
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
    removeFromMyList(movie);
    // Refresh the list after a short delay
    setTimeout(() => {
      getMovies();
    }, 500);
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
      
      <h1 className="text-3xl font-bold text-white mb-6">My List</h1>
      
      {myMovies.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-400">Your list is empty. Add some movies to get started!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Poster
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" 
                    onClick={() => handleSort('title')}>
                  Title {getSortIcon('title')}
                </th>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Note
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
                  <td className="px-4 py-4 whitespace-nowrap">
                    <img 
                      src={imageURL2 + movie.backdrop_path} 
                      alt={movie.title || movie.name}
                      className="h-16 w-28 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{movie.title || movie.name}</div>
                    <div className="text-sm text-gray-400">
                      {movie.release_date?.substring(0, 4) || 
                       movie.first_air_date?.substring(0, 4) || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${movie.userRating?.score >= 7 ? 'bg-green-800 text-green-100' : 
                        movie.userRating?.score >= 4 ? 'bg-yellow-800 text-yellow-100' : 
                        'bg-red-800 text-red-100'}`}>
                      {movie.userRating?.score || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {movie.userRating?.status || "N/A"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(movie.userRating?.dateAdded)}
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
                    <button
                      onClick={() => playMovie(movie, "MyList")}
                      className="text-indigo-400 hover:text-indigo-300 mr-3"
                      title="Play"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleRemoveMovie(movie)}
                      className="text-red-400 hover:text-red-300"
                      title="Remove"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyListTable; 