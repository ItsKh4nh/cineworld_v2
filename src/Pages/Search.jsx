import React, { useContext, useState } from "react";

import axios from "../axios";
import { API_KEY, imageURL2 } from "../config/constants";

import StarRatings from "../components/StarRatings";

import { PopUpContext } from "../contexts/moviePopUpContext";

import useGenresConverter from "../hooks/useGenresConverter";
import usePlayMovie from "../hooks/usePlayMovie";
import useUpdateMyList from "../hooks/useUpdateMyList";
import useMoviePopup from "../hooks/useMoviePopup";

function Search() {
  const { showModal } = useContext(PopUpContext);
  const { addToMyList, PopupMessage } = useUpdateMyList();
  const { playMovie } = usePlayMovie();
  const { convertGenre } = useGenresConverter();
  const { handleMoviePopup } = useMoviePopup();

  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);

  const Search = (e) => {
    setSearchQuery(e.target.value);
    e.preventDefault();
    console.log(searchQuery);

    axios
      .get(
        `/search/movie?api_key=${API_KEY}&language=en-US&query=${searchQuery}&page=1&include_adult=false`
      )
      .then((response) => {
        console.log(response.data.results);
        setMovies(response.data.results);
      });

    if (searchQuery === "") {
      setMovies([]);
    }
  };

  return (
    <div>
      {PopupMessage}

      <div className="flex justify-center mt-20 mb-8">
        <input
          onChange={Search}
          type="text"
          className="w-[60%] xl:w-1/4 bg-stone-700 text-white outline-none sm:text-sm rounded focus:ring-primary-600 focus:border-primary-600 block p-2.5 placeholder:text-white"
          placeholder="Search for any movie..."
          required=""
        ></input>
        <button
          onClick={Search}
          className="flex items-center px-8 text-white bg-red-800 -ml-2 focus:outline-none focus:ring-primary-300 transition ease-in-out font-medium rounded text-sm py-1 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
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
      <div className="grid-cols-2 grid p-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 md:p-5 space-y-1 lg:space-y-0 lg:grid lg:gap-3 lg:grid-rows-3">
        {movies.length !== 0 ? (
          movies.map((movie) => {
            // Add null check before converting genres
            const converted = movie.genre_ids
              ? convertGenre(movie.genre_ids)
              : [];
            return (
              <div className="p-1 mt-2 mb-5" key={movie.id}>
                <div className="hover:scale-105 hover:border-2 group relative block overflow-hidden rounded-sm transition-all duration-500">
                  <a
                    className="lightbox transition-all duration-500 group-hover:scale-105"
                    title=""
                  >
                    <img
                      onClick={() => handleMoviePopup(movie)}
                      className=""
                      src={
                        movie.backdrop_path
                          ? imageURL2 + movie.backdrop_path
                          : "https://i.ytimg.com/vi/Mwf--eGs05U/maxresdefault.jpg"
                      }
                    />
                  </a>
                  <div
                    style={{
                      background:
                        "linear-gradient(0deg, hsl(0deg 0% 4% / 92%) 0%, hsl(0deg 0% 0% / 50%) 35%, hsl(220deg 26% 44% / 0%) 100%)",
                    }}
                    className="hidden xl:block absolute -bottom-52 group-hover:bottom-0 w-full transition-all duration-500 p-4 rounded"
                  >
                    <div className="flex mb-1 transition ease-in-out delay-150">
                      {/* Play Button */}
                      <div
                        onClick={() => playMovie(movie)}
                        className="text-white w-10 h-10 2xl:w-14 2xl:h-14 border-[2px] 2xl:border-[3px] rounded-full p-2 mr-2 backdrop-blur-[1px] shadow-md ease-linear transition-all duration-150 hover:border-red-600 hover:text-red-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                          />
                        </svg>
                      </div>

                      {/* PopUp Button */}
                      <div
                        onClick={() => handleMoviePopup(movie)}
                        className="text-white w-10 h-10 2xl:w-14 2xl:h-14 border-[2px] 2xl:border-[3px] rounded-full p-2 mr-2 backdrop-blur-[1px] shadow-md ease-linear transition-all duration-150 hover:border-red-600 hover:text-red-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="text-shadow-xl"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </div>
                    </div>

                    <a className="hover:text-primary-600 text-shadow-xl shadow-red-700 text-white text-base 2xl:text-2xl transition duration-500 font-medium">
                      {movie.name || movie.title}
                    </a>

                    <br></br>
                    <StarRatings rating={movie.vote_average} showDenominator={false} />
                    <br></br>
                    <div className="mt-1">
                      {converted &&
                        converted.map((genre, index) => {
                          return (
                            <span
                              key={index}
                              className="text-white mr-4 text-xs 2xl:text-sm font-thin"
                            >
                              {genre}
                            </span>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <>
            <div>
              <div className="w-[100vw] h-[70vh] flex justify-center items-center"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Search;
