import React, { useEffect, useState, useContext } from "react";

import axios from "../../axios";
import { imageUrlOriginal, imageUrlBackup } from "../../config/constants";
import { AuthContext } from "../../contexts/UserContext";
import { RatingModalContext } from "../../contexts/RatingModalContext";

import useGenresConverter from "../../hooks/useGenresConverter";
import usePlayMovie from "../../hooks/usePlayMovie";
import useUpdateMyList from "../../hooks/useUpdateMyLis";
import useMoviePopup from "../../hooks/useMoviePopup";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "./RowPostStyles.scss";
import StarRating from "../StarRating/StarRating";

// Icons
import PlayIcon from "../../assets/play-icon.svg?react";
import EditIcon from "../../assets/edit-icon.svg?react";
import AddIcon from "../../assets/add-icon.svg?react";

function RowPost(props) {
  // Context hooks
  const { User } = useContext(AuthContext);
  const { openRatingModal } = useContext(RatingModalContext) || {};

  // Custom hooks
  const { addToMyList, PopupMessage } = useUpdateMyList();
  const { playMovie } = usePlayMovie();
  const { convertGenre } = useGenresConverter();
  const { handleMoviePopup, formatDate, myListMovies } = useMoviePopup();

  // Component state
  const [movies, setMovies] = useState([]);

  // Fetch movies when component mounts or when URL changes
  useEffect(() => {
    // Use provided movie data if available
    if (props.movieData) {
      setMovies(props.movieData);
      return;
    }

    // Otherwise fetch from API
    if (props.url) {
      axios
        .get(props.url)
        .then((response) => {
          if (response.data && response.data.results) {
            setMovies(response.data.results);
          } else {
            setMovies([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching movies:", error);
          setMovies([]);
        });
    }
  }, [props.url, props.movieData]);

  // Helper function to check if a movie is in the user's MyList
  const checkIfInMyList = (movie_id) => {
    if (!myListMovies || !Array.isArray(myListMovies)) {
      return false;
    }
    return myListMovies.some((movie) => movie.id === movie_id);
  };

  // Responsive configuration for Swiper
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
            className="mySwiper SwiperStyle"
            slidesPerView={6.1}
            spaceBetween={8}
            breakpoints={customSettings.breakpoints}
          >
            {movies.map((obj) => {
              const converted = convertGenre(obj.genre_ids);
              // Check if this movie is in the user's MyList
              const isInMyList = checkIfInMyList(obj.id);
              return (
                <SwiperSlide
                  key={obj.id}
                  className={props.islarge ? "large" : "bg-cover"}
                  onClick={() => handleMoviePopup({ ...obj, isInMyList })}
                >
                  {props.islarge ? (
                    <>
                      <img
                        className="rounded-sm"
                        src={`${imageUrlOriginal + obj.poster_path}`}
                      />
                    </>
                  ) : (
                    <>
                      <img
                        loading="lazy"
                        className="rounded-sm"
                        src={
                          obj.backdrop_path
                            ? `${imageUrlBackup + obj.backdrop_path}`
                            : "/placeholder.jpg"
                        }
                      />
                    </>
                  )}
                  <div className="content pt-16">
                    <div className="flex transition ml-3 ease-in-out delay-150">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          playMovie(obj);
                        }}
                        className="text-white w-9 h-9 border-[2px] rounded-full flex items-center justify-center mr-1 backdrop-blur-[2px] shadow-md ease-linear transition-all duration-150 hover:text-black hover:bg-white"
                      >
                        <PlayIcon />
                      </div>

                      {isInMyList ? (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (openRatingModal) {
                              openRatingModal(
                                { ...obj, isInMyList: true },
                                User
                              );
                            }
                          }}
                          className="bg-cineworldYellow text-white w-9 h-9 rounded-full flex items-center justify-center mr-1 backdrop-blur-[1px] shadow-md ease-linear transition-all duration-150 hover:bg-white hover:text-cineworldYellow"
                        >
                          <EditIcon />
                        </div>
                      ) : (
                        <div
                          onClick={async (e) => {
                            e.stopPropagation();
                            // Update the movies array with the updated isInMyList status
                            const result = await addToMyList({
                              ...obj,
                              isInMyList: false,
                            });
                            if (result) {
                              // If successful, update the movies state to reflect the change
                              setMovies((prevMovies) =>
                                prevMovies.map((movie) =>
                                  movie.id === obj.id
                                    ? { ...movie, isInMyList: true }
                                    : movie
                                )
                              );
                            }
                          }}
                          className="text-white w-9 h-9 border-[2px] rounded-full flex items-center justify-center mr-1 backdrop-blur-[1px] shadow-md ease-linear transition-all duration-150 hover:text-black hover:bg-white"
                        >
                          <AddIcon />
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

                    {converted &&
                      Array.isArray(converted) &&
                      converted.length > 0 &&
                      converted.map((genre, idx) => {
                        return (
                          <span
                            key={`${obj.id}-${idx}`}
                            className="hidden text-white ml-4 font-thin text-xs lg:inline"
                          >
                            {genre}
                          </span>
                        );
                      })}
                  </div>
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
