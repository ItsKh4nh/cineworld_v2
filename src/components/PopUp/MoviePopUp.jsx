import React, { useContext, useEffect, useState } from "react";
import { Fade } from "react-awesome-reveal";
import YouTube from "react-youtube";
import StarRating from '../StarRating/StarRating';

import { imageURL } from "../../config/constants";
import { API_KEY } from "../../config/constants";
import { PopUpContext } from "../../contexts/moviePopUpContext";
import { AuthContext } from "../../contexts/UserContext";
import useGenresConverter from "../../hooks/useGenresConverter";
import usePlayMovie from "../../hooks/usePlayMovie";
import useUpdateMyList from "../../hooks/useUpdateMyList";
import useMoviePopup from "../../hooks/useMoviePopup";
import useGuestMode from "../../hooks/useGuestMode";
import { RatingModalContext } from "../../contexts/RatingModalContext";
import axios from "../../axios";

// Import SVGs as React Components
import PlayCircleIcon from '../../icons/play-circle-icon.svg?react';
import RemoveCircleIcon from '../../icons/remove-circle-icon.svg?react';
import AddCircleIcon from '../../icons/add-circle-icon.svg?react';

function MoviePopUp() {
  const { User } = useContext(AuthContext);
  const { showModal, setShowModal, movieInfo, trailerUrl } = useContext(PopUpContext);
  const { addToMyList, removeFromMyList, PopupMessage } = useUpdateMyList();
  const { openRatingModal } = useContext(RatingModalContext) || {};
  const { isAuthenticated } = useGuestMode();
  const { playMovie } = usePlayMovie();
  const { convertGenre } = useGenresConverter();
  const { formatDate } = useMoviePopup();
  const [cast, setCast] = useState([]);
  const [hasMoreCast, setHasMoreCast] = useState(false);
  const [director, setDirector] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isInUserList, setIsInUserList] = useState(false);

  // YouTube player options with autoplay enabled
  const opts = {
    height: "350",
    width: "100%",
    playerVars: {
      autoplay: 1,
    },
  };

  // Add body overflow control when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
      // Set visible immediately to prevent delay
      setIsVisible(true);
    } else {
      document.body.style.overflow = 'auto';
      setIsVisible(false);
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  // Fetch cast and crew information when movie info changes
  useEffect(() => {
    if (movieInfo && movieInfo.id) {
      axios
        .get(`/movie/${movieInfo.id}/credits?api_key=${API_KEY}`)
        .then((response) => {
          if (response.data.cast && response.data.cast.length > 0) {
            // Check if there are more than 10 cast members
            setHasMoreCast(response.data.cast.length > 10);
            // Get the first 10 cast members
            setCast(response.data.cast.slice(0, 10));
          }

          if (response.data.crew && response.data.crew.length > 0) {
            const directorInfo = response.data.crew.find(
              (person) => person.job === "Director"
            );
            setDirector(directorInfo ? directorInfo.name : "");
          }
        })
        .catch((error) => {
          console.error("Error fetching credits:", error);
        });
    }
  }, [movieInfo]);

  // Update internal state when movieInfo changes
  useEffect(() => {
    if (movieInfo) {
      setIsInUserList(movieInfo.isInMyList || false);
    }
  }, [movieInfo]);

  if (!movieInfo || Object.keys(movieInfo).length === 0) {
    return null;
  }

  // Handle adding to MyList
  const handleAddToMyList = async () => {
    try {
      const result = await addToMyList(movieInfo);
      if (result === true) {
        setIsInUserList(true);
      }
    } catch (error) {
      console.error("Error adding movie to list:", error);
    }
  };

  // Handle removing from MyList
  const handleRemoveFromMyList = async () => {
    try {
      const result = await removeFromMyList(movieInfo);
      if (result === true) {
        setIsInUserList(false);
      }
    } catch (error) {
      console.error("Error removing movie from list:", error);
    }
  };

  return (
    <>
      {PopupMessage}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-70"
            onClick={() => setShowModal(false)}
          ></div>

          <div className="relative z-50 w-full max-w-3xl mx-4 my-8 rounded-lg overflow-hidden">
            {isVisible && (
              <Fade direction="up" duration={300} triggerOnce>
                <div className="bg-neutral-800 rounded-lg shadow-xl">
                  {/* Video */}
                  <div className="relative w-full" style={{ height: "350px" }}>
                    {trailerUrl ? (
                      <YouTube
                        videoId={trailerUrl}
                        opts={opts}
                        className="absolute top-0 left-0 w-full h-full"
                      />
                    ) : movieInfo.backdrop_path ? (
                      <img
                        src={`${imageURL + movieInfo.backdrop_path}`}
                        alt={movieInfo.title || movieInfo.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                        <span className="text-neutral-400">No preview available</span>
                      </div>
                    )}
                  </div>

                  {/* Title and Overview */}
                  <div className="p-4">
                    <h3 className="text-2xl font-semibold text-white">
                      {movieInfo.title || movieInfo.name}
                    </h3>
                    <p className="text-neutral-300 text-sm mt-2 mb-3">
                      {movieInfo.overview}
                    </p>
                  </div>

                  {/* Movie info - Updated layout with left and right columns */}
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-2 gap-x-6">
                      {/* Left column - 3 rows */}
                      <div className="flex flex-col space-y-4">
                        <div>
                          <div className="text-neutral-400 text-xs">Rating</div>
                          <div className="text-white">
                            <StarRating rating={movieInfo.vote_average} size="large" />
                          </div>
                        </div>

                        <div>
                          <div className="text-neutral-400 text-xs">Released on</div>
                          <div className="text-white text-sm">
                            {formatDate(movieInfo.release_date || movieInfo.first_air_date)}
                          </div>
                        </div>

                        <div>
                          <div className="text-neutral-400 text-xs">Genres</div>
                          <div className="text-white text-sm">
                            {movieInfo.genre_ids && convertGenre(movieInfo.genre_ids).join(', ')}
                          </div>
                        </div>
                      </div>

                      {/* Right column - 2 rows (with Cast taking more space) */}
                      <div className="flex flex-col space-y-4">
                        {director && (
                          <div>
                            <div className="text-neutral-400 text-xs">Director</div>
                            <div className="text-white text-sm">{director}</div>
                          </div>
                        )}

                        {cast.length > 0 && (
                          <div>
                            <div className="text-neutral-400 text-xs">Cast</div>
                            <div className="text-white text-sm flex flex-wrap mt-1">
                              {cast.map((actor, index) => (
                                <span key={actor.id} className="mr-1">
                                  {actor.name}
                                  {index < cast.length - 1 ? ", " : ""}
                                </span>
                              ))}
                              {hasMoreCast && <span>and more</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Buttons at the bottom */}
                  <div className="flex px-4 py-3 border-t border-neutral-700">
                    <div className="flex gap-2">
                      <button
                        className="flex items-center justify-center bg-cineworldYellow hover:bg-white hover:text-cineworldYellow transition-colors text-white font-medium px-4 py-2 rounded"
                        onClick={() => {
                          setShowModal(false);
                          playMovie(movieInfo);
                        }}
                      >
                        <PlayCircleIcon className="h-5 w-5 mr-1" />
                        Play
                      </button>

                      {isAuthenticated() && isInUserList ? (
                        <button
                          className="flex items-center justify-center border border-white text-white font-medium py-2 px-4 rounded hover:bg-white hover:text-black transition-colors"
                          onClick={handleRemoveFromMyList}
                        >
                          <RemoveCircleIcon className="h-5 w-5 mr-1" />
                          Remove
                        </button>
                      ) : (
                        <button
                          className="flex items-center justify-center border border-white text-white font-medium py-2 px-4 rounded hover:bg-white hover:text-black transition-colors"
                          onClick={handleAddToMyList}
                        >
                          <AddCircleIcon className="h-5 w-5 mr-1" />
                          Add to MyList
                        </button>
                      )}
                    </div>

                    <button
                      className="flex items-center justify-center bg-red-700 hover:bg-white hover:text-red-700 transition-colors text-white font-medium py-2 px-4 rounded ml-auto"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </Fade>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default MoviePopUp;