import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import axios from "../axios";
import { searchMovie } from "../config/URLs";
import { imageURL2, API_KEY } from "../config/constants";
import { AuthContext } from "../contexts/UserContext";

import StarRatings from "../components/StarRatings";
import { PopUpContext } from "../contexts/moviePopUpContext";
import useGenresConverter from "../hooks/useGenresConverter";
import useMoviePopup from "../hooks/useMoviePopup";
import useUpdateMyList from "../hooks/useUpdateMyList";
import { RatingModalContext } from "../contexts/RatingModalContext";

function Search() {
  const { User } = useContext(AuthContext);
  const { handleMoviePopup, myListMovies } = useMoviePopup();
  const { convertGenre } = useGenresConverter();
  const { addToMyList } = useUpdateMyList();
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const { openRatingModal } = useContext(RatingModalContext) || {};

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const Search = (e) => {
    setSearchQuery(e.target.value);
    e.preventDefault();

    if (searchQuery.trim() !== "") {
      axios
        .get(searchMovie(searchQuery))
        .then((response) => {
          // Add isInMyList property to each movie
          const moviesWithMyListStatus = response.data.results.map(movie => ({
            ...movie,
            isInMyList: myListMovies.some(m => m.id === movie.id)
          }));
          setMovies(moviesWithMyListStatus);
        })
        .catch(error => {
          console.error("Error searching movies:", error);
        });
    } else {
      setMovies([]);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="flex justify-center pt-20 pb-8">
        <input
          onChange={Search}
          type="text"
          className="w-[60%] xl:w-1/4 bg-stone-700 text-white outline-none sm:text-sm rounded focus:ring-primary-600 focus:border-primary-600 block p-2.5 placeholder:text-white"
          placeholder="Search for any movie..."
          required=""
        />
        <button
          onClick={Search}
          className="flex items-center px-8 text-white bg-red-800 -ml-2 focus:outline-none focus:ring-primary-300 transition ease-in-out font-medium rounded text-sm py-1 text-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 items-center text-white mt-auto mb-auto pr-4 cursor-pointer"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>{" "}
          Search
        </button>
      </div>

      {/* Search results */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-8">
        {movies.length > 0 ? (
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
        ) : searchQuery.trim() !== "" ? (
          <div className="col-span-full flex justify-center items-center h-64">
            <p className="text-white text-lg">No movies found</p>
          </div>
        ) : (
          <div className="col-span-full flex justify-center items-center h-64">
            <p className="text-white text-lg">Search for movies to display results</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
