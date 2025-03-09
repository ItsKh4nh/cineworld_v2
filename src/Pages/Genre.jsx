import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../axios";
import { imageURL2, genresList } from "../config/constants";
import { AuthContext } from "../contexts/UserContext";
import Footer from "../components/Footer/Footer";
import useGenresConverter from "../hooks/useGenresConverter";
import useMoviePopup from "../hooks/useMoviePopup";
import useUpdateMyList from "../hooks/useUpdateMyList";
import { RatingModalContext } from "../contexts/RatingModalContext";

function Genre() {
  const { genreName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const currentPage = parseInt(queryParams.get('page') || '1');
  
  const { User } = useContext(AuthContext);
  const { handleMoviePopup, myListMovies } = useMoviePopup();
  const { convertGenre } = useGenresConverter();
  const { addToMyList } = useUpdateMyList();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openRatingModal } = useContext(RatingModalContext) || {};
  const [displayName, setDisplayName] = useState("");
  const [genreId, setGenreId] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState(currentPage);

  // Update input page when current page changes
  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  // Scroll to top when component mounts or page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [genreName, currentPage]);

  // Get genre ID from name
  useEffect(() => {
    if (genreName) {
      const formattedGenreName = genreName.replace(/-/g, ' ').toLowerCase();
      const genre = genresList.find(g => g.name.toLowerCase() === formattedGenreName);
      if (genre) {
        setGenreId(genre.id);
        setDisplayName(genre.name);
      }
    }
  }, [genreName]);

  // Fetch movies by genre
  useEffect(() => {
    if (genreId) {
      setLoading(true);
      // Modify the URL to include the page parameter
      const url = `discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=1000&with_genres=${genreId}&page=${currentPage}`;
      
      axios
        .get(url)
        .then((response) => {
          // Add isInMyList property to each movie
          const moviesWithMyListStatus = response.data.results.map(movie => ({
            ...movie,
            isInMyList: myListMovies.some(m => m.id === movie.id)
          }));
          setMovies(moviesWithMyListStatus);
          setTotalPages(response.data.total_pages > 500 ? 500 : response.data.total_pages); // TMDB API limits to 500 pages
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching genre movies:", error);
          setLoading(false);
        });
    }
  }, [genreId, currentPage, myListMovies]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      navigate(`/genre/${genreName}?page=${newPage}`);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
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
    if (e.key === 'Enter') {
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
              currentPage <= 1 ? 'bg-gray-700 text-gray-500' : 'bg-gray-800 text-white hover:bg-gray-700'
            } transition-colors`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
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
              currentPage >= totalPages ? 'bg-gray-700 text-gray-500' : 'bg-gray-800 text-white hover:bg-gray-700'
            } transition-colors`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
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
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-8 pb-12">
        {loading ? (
          <div className="col-span-full flex justify-center items-center h-64">
            <p className="text-white text-lg">Loading...</p>
          </div>
        ) : movies.length > 0 ? (
          movies.map((movie) => (
            <div 
              key={movie.id} 
              className="cursor-pointer relative group bg-zinc-900 rounded-lg overflow-hidden"
              onClick={() => handleMoviePopup(movie)}
            >
              {/* Movie poster/backdrop */}
              <div className="relative aspect-video">
                <img
                  className="w-full h-full object-cover"
                  src={
                    movie.backdrop_path
                      ? imageURL2 + movie.backdrop_path
                      : "https://i.ytimg.com/vi/Mwf--eGs05U/maxresdefault.jpg"
                  }
                  alt={movie.title || movie.name}
                  loading="lazy"
                />
                
                {/* Play and Add buttons - always visible at top left */}
                <div className="absolute top-3 left-3 flex space-x-2">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      // Play movie functionality
                    }}
                    className="text-white w-10 h-10 border-2 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md hover:text-black hover:bg-white transition-all duration-150"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>
                  </div>
                  
                  {movie.isInMyList ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (openRatingModal) {
                          openRatingModal(movie, User);
                        }
                      }}
                      className="bg-cineworldYellow text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md hover:bg-white hover:text-cineworldYellow transition-all duration-150"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </div>
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        addToMyList(movie);
                      }}
                      className="text-white w-10 h-10 border-2 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md hover:text-black hover:bg-white transition-all duration-150"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Movie details */}
              <div className="p-4">
                {/* Movie title */}
                <h2 className="text-white text-xl font-bold mb-1 line-clamp-1">{movie.title || movie.name}</h2>
                
                {/* Release date */}
                <p className="text-white/80 text-sm mb-2">
                  {movie.release_date || movie.first_air_date ? new Date(movie.release_date || movie.first_air_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'Release date unknown'}
                </p>
                
                {/* Star rating with number */}
                <div className="flex items-center mb-3">
                  <span className="text-yellow-400 text-lg mr-1">★</span>
                  <span className="text-white text-lg">
                    {movie.vote_average 
                      ? Number(movie.vote_average).toFixed(2).replace(/\.?0+$/, '')
                      : '0'}
                  </span>
                </div>
                
                {/* Genres */}
                <div className="flex flex-wrap gap-2">
                  {convertGenre(movie.genre_ids)?.map((genre, idx) => (
                    <span key={idx} className="text-white/80 text-sm">
                      {idx > 0 && <span className="mx-1">•</span>}
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center h-64">
            <p className="text-white text-lg">No movies found for this genre</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && movies.length > 0 && renderPagination()}
      
      <Footer />
    </div>
  );
}

export default Genre; 