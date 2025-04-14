import React, { useEffect, useState, useRef, useContext } from "react";

import { Fade } from "react-awesome-reveal";
import axios from "../../axios";
import { API_KEY, imageURL, imageURL2 } from "../../config/constants";
import { AuthContext } from "../../contexts/UserContext";

import useGenresConverter from "../../hooks/useGenresConverter";
import usePlayMovie from "../../hooks/usePlayMovie";
import useUpdateMyList from "../../hooks/useUpdateMyList";
import useMoviePopup from "../../hooks/useMoviePopup";
import { RatingModalContext } from "../../contexts/RatingModalContext";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./RowPostStyles.scss";
import StarRating from "../StarRating/StarRating";

function RowPost(props) {
  const { User } = useContext(AuthContext);
  const { addToMyList, PopupMessage } = useUpdateMyList();
  const { playMovie } = usePlayMovie();
  const { convertGenre } = useGenresConverter();
  const { handleMoviePopup, formatDate, myListMovies } = useMoviePopup();
  const { openRatingModal } = useContext(RatingModalContext) || {};

  const [movies, setMovies] = useState([]);
  const [shouldPop, setShouldPop] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // If movieData prop is provided, use that instead of fetching from URL
    if (props.movieData) {
      setMovies(props.movieData);
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch movies from the URL
    if (props.url) {
      setIsLoading(true);
      axios.get(props.url)
        .then((response) => {
          if (response.data && response.data.results) {
            setMovies(response.data.results);
          } else {
            // Handle case when results array is missing
            setMovies([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching movies:", error);
          setIsError(true);
          setMovies([]); // Set movies to empty array on error
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [props.url, props.movieData]);

  // Function to check if a movie is in the user's MyList
  const checkIfInMyList = (movie_id) => {
    if (!myListMovies || !Array.isArray(myListMovies)) {
      return false;
    }
    return myListMovies.some(movie => movie.id === movie_id);
  };

  const customSettings = {
    breakpoints: {
      1800: { slidesPerView: 6.1, slidesPerGroup: 5 },
      1690: { slidesPerView: 5.5, slidesPerGroup: 5 },
      1536: { slidesPerView: 5, slidesPerGroup: 5 },
      1280: { slidesPerView: 4.3, slidesPerGroup: 4 },
      768: { slidesPerView: 3.3, slidesPerGroup: 3 },
      625: { slidesPerView: 3.1, slidesPerGroup: 3 },
      330: { slidesPerView: 2.1, slidesPerGroup: 2 },
      0: { slidesPerView: 2, slidesPerGroup: 2 },
    },
  };

  const opts = {
    width: "100%",
    height: "auto",
    playerVars: {
      autoplay: 1,
      controls: 0,
    },
    modestbranding: 1,
    rel: 0,
    autohide: 1,
    showinfo: 0,
  };

  return (
    <div
      className="ml-2 lg:ml-11 mb-11 lg:mb-4 RowContainer"
      style={{ marginTop: `${props.first ? "-8rem" : ""}` }}
    >
      {PopupMessage}

      {movies && movies.length > 0 ? (
        <>
          <h1 className="text-white pb-4 xl:pb-0 font-normal text-base sm:text-2xl md:text-4xl">
            {props.title}
          </h1>

          <Swiper
            navigation={true}
            pagination={false}
            modules={[Navigation]}
            className="mySwiper"
            slidesPerView={6.1}
            spaceBetween={8}
            breakpoints={customSettings.breakpoints}
          >
            {movies.map((obj, index) => {
              const converted = convertGenre(obj.genre_ids);
              // Check if this movie is in the user's MyList
              const isInMyList = checkIfInMyList(obj.id);
              return (
                <SwiperSlide
                  key={obj.id}
                  className={props.islarge ? "large" : "bg-cover"}
                  onClick={() => handleMoviePopup({...obj, isInMyList})}
                >
                  {props.islarge ? (
                    <>
                      <img
                        className="rounded-sm"
                        src={`${imageURL + obj.poster_path}`}
                      />
                    </>
                  ) : (
                    <>
                      <img
                        loading="lazy"
                        className="rounded-sm"
                        src={
                          obj.backdrop_path
                            ? `${imageURL2 + obj.backdrop_path}`
                            : "/placeholder.jpg"
                        }
                        onClick={() => handleMoviePopup({...obj, isInMyList})}
                      />
                    </>
                  )}
                  <Fade direction="bottom" duration={300}>
                    <div className="content pt-16">
                      <div className="flex transition ml-3 ease-in-out delay-150">
                        <div
                          onClick={() => playMovie(obj)}
                          onMouseEnter={() => setShouldPop(false)}
                          onMouseLeave={() => setShouldPop(true)}
                          className="text-white w-9 h-9 border-[2px] rounded-full flex items-center justify-center mr-1 backdrop-blur-[2px] shadow-md ease-linear transition-all duration-150 hover:text-black hover:bg-white"
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

                        {isInMyList ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              if (openRatingModal) {
                                openRatingModal(obj, User);
                              }
                            }}
                            onMouseEnter={() => setShouldPop(false)}
                            onMouseLeave={() => setShouldPop(true)}
                            className="bg-cineworldYellow text-white w-9 h-9 rounded-full flex items-center justify-center mr-1 backdrop-blur-[1px] shadow-md ease-linear transition-all duration-150 hover:bg-white hover:text-cineworldYellow"
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
                              addToMyList({...obj, isInMyList: false});
                            }}
                            onMouseEnter={() => setShouldPop(false)}
                            onMouseLeave={() => setShouldPop(true)}
                            className="text-white w-9 h-9 border-[2px] rounded-full flex items-center justify-center mr-1 backdrop-blur-[1px] shadow-md ease-linear transition-all duration-150 hover:text-black hover:bg-white"
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

                      <h1 className="text-white ml-4 font-medium w-4/5 xl:line-clamp-1">
                        {obj.name || obj.title}
                      </h1>

                      <h1 className="text-white text-xs font-semibold ml-4 w-11/12">
                        {formatDate(obj.release_date || obj.first_air_date)}
                      </h1>

                      <div className="ml-4">
                        <StarRating rating={obj.vote_average} />
                      </div>

                      {converted && Array.isArray(converted) && converted.length > 0 && (
                        converted.map((genre, idx) => {
                          return (
                            <span
                              key={`${obj.id}-${idx}`}
                              className="hidden text-white ml-4 font-thin text-xs lg:inline"
                            >
                              {genre}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </Fade>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </>
      ) : (
        <>
          <div className="animate-pulse">
            <div className="w-72 ml-1 mt-2 sm:ml-0 sm:w-96 py-5 mb-5 xl:py-4 2xl:py-6 xl:w-45rem bg-neutral-900 rounded-md"></div>
            <div className="w-91% md:w-98% ml-1 mb-14 sm:ml-0 py-16 md:py-24  bg-neutral-900 rounded-md"></div>
          </div>
        </>
      )}
    </div>
  );
}

export default RowPost;
