import React, { useContext, useState, useEffect } from "react";

import axios from "../axios";
import { searchMovie } from "../config/URLs";
import { imageURL2 } from "../config/constants";

import StarRatings from "../components/StarRatings";
import { PopUpContext } from "../contexts/moviePopUpContext";
import useGenresConverter from "../hooks/useGenresConverter";
import useMoviePopup from "../hooks/useMoviePopup";
import useUpdateMyList from "../hooks/useUpdateMyList";

function Search() {
  const { handleMoviePopup, myListMovies } = useMoviePopup();
  const { convertGenre } = useGenresConverter();
  const { addToMyList } = useUpdateMyList();
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-4 md:px-8">
        {movies.length > 0 ? (
          movies.map((movie) => (
            <div 
              key={movie.id} 
              className="cursor-pointer transition-transform duration-200 hover:scale-105 relative"
              onClick={() => handleMoviePopup(movie)}
            >
              <div className="relative overflow-hidden rounded-md">
                <img
                  className="w-full h-auto object-cover rounded-md"
                  src={
                    movie.backdrop_path
                      ? imageURL2 + movie.backdrop_path
                      : "https://i.ytimg.com/vi/Mwf--eGs05U/maxresdefault.jpg"
                  }
                  alt={movie.title || movie.name}
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                  <h3 className="text-white font-medium text-sm md:text-base truncate">
                    {movie.title || movie.name}
                  </h3>
                  <div className="flex items-center mt-1">
                    <StarRatings rating={movie.vote_average} showDenominator={false} starSize="small" />
                  </div>
                </div>
              </div>
              
              {/* Add circular buttons for play and add/edit */}
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 hover:opacity-100">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    // Play movie functionality would go here
                  }}
                  className="text-white w-9 h-9 border-[2px] rounded-full flex items-center justify-center backdrop-blur-[2px] shadow-md ease-linear transition-all duration-150 hover:text-black hover:bg-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                    />
                  </svg>
                </div>
                
                {movie.isInMyList ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      // Edit functionality would go here
                      addToMyList(movie);
                    }}
                    className="bg-cineworldYellow text-white w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-[1px] shadow-md ease-linear transition-all duration-150 hover:bg-white hover:text-cineworldYellow"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                      />
                    </svg>
                  </div>
                ) : (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      addToMyList(movie);
                    }}
                    className="text-white w-9 h-9 border-[2px] rounded-full flex items-center justify-center backdrop-blur-[1px] shadow-md ease-linear transition-all duration-150 hover:text-black hover:bg-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </div>
                )}
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
