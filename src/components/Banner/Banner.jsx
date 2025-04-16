import React, { useState, useEffect, useContext } from "react";
import { Fade } from "react-awesome-reveal";
import StarRating from "../StarRating/StarRating";

// Axios and constants
import axios from "../../axios";
import { imageURL } from "../../config/constants";

// Context and hooks
import { PopUpContext } from "../../contexts/moviePopUpContext";
import usePlayMovie from "../../hooks/usePlayMovie";
import useGenresConverter from "../../hooks/useGenresConverter";
import useUpdateMyList from "../../hooks/useUpdateMyList";
import useMoviePopup from "../../hooks/useMoviePopup";

// Import SVGs as React Components
import PlayIcon from '../../icons/play-icon.svg?react';
import MoreInfoIcon from '../../icons/more-info-icon.svg?react';
import LoadingPlayIcon from '../../icons/loading-play-icon.svg?react';

function Banner(props) {
  const { showModal, setShowModal } = useContext(PopUpContext);
  const { playMovie } = usePlayMovie();
  const { convertGenre } = useGenresConverter();
  const { addToMyList, PopupMessage } = useUpdateMyList();
  const { handleMoviePopup, formatDate, myListMovies } = useMoviePopup();

  const [movie, setMovie] = useState([]);
  
  function getWindowSize() {
    const { innerWidth: width } = window;
    return { width };
  }
  const [windowSize, setWindowSize] = useState(getWindowSize());

  const fetchMovies = async () => {
    try {
      const response = await axios.get(props.url);
      const randomMovie = response.data.results.sort(() => 0.5 - Math.random())[0];

      // Check if movie is in MyList
      const isInMyList = myListMovies.some((m) => m.id === randomMovie.id);
      setMovie({
        ...randomMovie,
        isInMyList,
      });
    } catch (error) {
      // Handle error
    }
  };

  useEffect(() => {
    fetchMovies();

    const handleWindowResize = () => {
      setWindowSize(getWindowSize());
    };

    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, [props.url, myListMovies]);

  return (
    <>
      <div
        style={{
          backgroundImage: `linear-gradient(90deg, hsl(0deg 0% 7% / 91%) 0%, hsl(0deg 0% 0% / 0%) 35%, hsl(220deg 26% 44% / 0%) 100%), url(${
            movie ? imageURL + movie.backdrop_path : ""
          })`,
        }}
        className="h-[50rem] md:h-[55rem] 3xl:h-[63rem] bg-cover bg-center object-contain grid items-center"
      >
        <div className="ml-2 mr-2 sm:mr-0 sm:ml-12 mt-[75%] sm:mt-52">
          <Fade direction="bottom">
            {movie.title || movie.name ? (
              <div className="flex flex-wrap items-center mb-5">
                <div className="flex items-center">
                  <h1 className="text-white text-3xl font-semibold text-center py-2 sm:text-left sm:text-5xl sm:border-l-8 pl-4 border-cineworldYellow md:text-6xl sm:font-bold drop-shadow-lg">
                    {movie.title || movie.name}
                  </h1>
                </div>
              </div>
            ) : (
              <div className="grid justify-center sm:justify-start">
                <div className="animate-pulse w-72 ml-4 sm:ml-0 sm:w-96 py-5 mb-7 xl:py-7 xl:w-45rem bg-neutral-900 rounded-md"></div>
              </div>
            )}

            <div className="flex flex-col space-y-3 mb-4">
              <div className="flex items-center">
                <div className="flex justify-center sm:justify-start">
                  {movie.vote_average ? (
                    <StarRating rating={movie.vote_average} size="large" showDenominator={true} />
                  ) : null}
                </div>
                <div className="flex justify-center sm:justify-start ml-6">
                  {movie.release_date || movie.first_air_date ? (
                    <h1 className="flex text-white text-xl font-bold drop-shadow-lg">
                      {formatDate(movie.release_date || movie.first_air_date)}
                    </h1>
                  ) : null}
                </div>
              </div>

              {movie.genre_ids && movie.genre_ids.length > 0 && (
                <div className="flex items-center">
                  <div className="flex text-white text-lg">
                    {convertGenre(movie.genre_ids).map((genre, index, array) => (
                      <React.Fragment key={index}>
                        <span className="font-medium">{genre}</span>
                        {index < array.length - 1 && (
                          <span className="mx-2 text-gray-400">•</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 mb-4">
              {movie.overview ? (
                <h1 className="text-white text-xl drop-shadow-xl text-center line-clamp-2 sm:line-clamp-3 sm:text-left w-full md:w-4/5 lg:w-8/12 lg:text-xl xl:w-5/12 2xl:text-2xl">
                  {movie.overview}
                </h1>
              ) : (
                <div className="grid justify-center md:justify-start">
                  <div className="animate-pulse w-80 sm:w-40rem md:w-45rem py-1 mb-3 xl:w-70rem xl:py-2 bg-neutral-900 rounded-md"></div>
                  <div className="animate-pulse w-80 sm:w-40rem md:w-45rem py-1 mb-3 xl:w-70rem xl:py-2 bg-neutral-900 rounded-md"></div>
                  <div className="animate-pulse w-80 sm:w-40rem md:w-45rem py-1 mb-7 xl:w-70rem xl:py-2 bg-neutral-900 rounded-md"></div>
                </div>
              )}
            </div>

            <div className="flex justify-center sm:justify-start">
              {movie.id ? (
                <>
                  <button
                    onClick={() => playMovie(movie)}
                    className="bg-cineworldYellow hover:bg-white hover:text-cineworldYellow transition duration-500 ease-in-out shadow-2xl flex items-center mb-3 mr-3 text-base sm:text-xl font-semibold text-white py-2 sm:py-2 px-10 sm:px-14 rounded-md"
                  >
                    <PlayIcon className="w-6 h-6 mr-2" />
                    Play
                  </button>
                  <button
                    onClick={() => handleMoviePopup(movie)}
                    className="bg-[#33333380] flex items-center shadow-2xl mb-3 text-base sm:text-xl font-semibold text-white hover:bg-white hover:text-black transition duration-500 ease-in-out py-2 px-8 rounded-md"
                  >
                    <MoreInfoIcon className="w-6 h-6 mr-2" />
                    More Info
                  </button>
                </>
              ) : (
                <>
                  <button className="animate-pulse bg-neutral-900 transition duration-500 ease-in-out shadow-2xl flex items-center mb-3 mr-3 text-base sm:text-xl font-semibold text-neutral-500 py-2 sm:py-2 px-10 sm:px-14 rounded-md">
                    <LoadingPlayIcon className="w-6 h-6 mr-2" />
                    Play
                  </button>
                  <button className="animate-pulse bg-neutral-900 flex items-center shadow-2xl mb-3 text-base sm:text-xl font-semibold text-neutral-500 transition duration-500 ease-in-out py-2 px-8 rounded-md">
                    <MoreInfoIcon className="w-6 h-6 mr-2" />
                    More Info
                  </button>
                </>
              )}
            </div>
          </Fade>
        </div>
        <div
          style={{
            backgroundImage:
              "linear-gradient(hsl(0deg 0% 0% / 0%), hsl(0deg 0% 0% / 38%), hsl(0deg 0% 7%))",
          }}
          className="h-80 mt-auto"
        ></div>
      </div>
    </>
  );
}

export default Banner;
