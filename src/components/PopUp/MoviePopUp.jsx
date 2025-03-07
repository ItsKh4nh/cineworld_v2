import React, { useContext, useEffect } from "react";
import { Fade } from "react-awesome-reveal";
import StarRatings from "../StarRatings";
import YouTube from "react-youtube";

import { imageURL } from "../../config/constants";
import { PopUpContext } from "../../contexts/moviePopUpContext";
import useGenresConverter from "../../hooks/useGenresConverter";
import usePlayMovie from "../../hooks/usePlayMovie";
import useUpdateMyList from "../../hooks/useUpdateMyList";
import useMoviePopup from "../../hooks/useMoviePopup";

function MoviePopUp() {
  const { showModal, setShowModal, movieInfo, trailerUrl } = useContext(PopUpContext);
  const { addToMyList, removeFromMyList, PopupMessage } = useUpdateMyList();
  const { playMovie } = usePlayMovie();
  const { convertGenre } = useGenresConverter();
  const { formatDate } = useMoviePopup();

  // YouTube player options
  const opts = {
    height: "390",
    width: "100%",
    playerVars: {
      autoplay: 0,
    },
  };

  // Add body overflow control when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  // Check if we have a movie to display
  if (!movieInfo || Object.keys(movieInfo).length === 0) {
    return null;
  }

  const isInMyList = movieInfo.isInMyList;

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
            <Fade direction="up" duration={500}>
              <div className="bg-neutral-800 rounded-lg shadow-xl">
                {/* Movie Trailer or Image */}
                {trailerUrl ? (
                  <div className="relative pt-[56.25%] w-full">
                    <YouTube
                      videoId={trailerUrl}
                      opts={opts}
                      className="absolute top-0 left-0 w-full h-full"
                    />
                  </div>
                ) : movieInfo.backdrop_path ? (
                  <img 
                    src={`${imageURL + movieInfo.backdrop_path}`}
                    alt={movieInfo.title || movieInfo.name}
                    className="w-full rounded-t-lg"
                  />
                ) : null}

                {/* Play button */}
                <div className="flex ml-4 items-center -mt-14 relative z-10">
                  <button
                    className="flex items-center justify-center bg-red-700 hover:bg-red-800 text-white font-medium sm:font-bold uppercase text-xs px-4 sm:px-6 md:text-sm py-2 rounded shadow hover:shadow-lg cursor-pointer transition-all duration-200"
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      playMovie(movieInfo);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Play
                  </button>
                </div>

                {/* Movie title */}
                <div className="p-5 pt-6">
                  <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
                    {movieInfo.title || movieInfo.name}
                  </h3>
                  
                  <div className="h-[1px] bg-neutral-700 my-3"></div>
                  
                  {/* Movie overview */}
                  <p className="text-neutral-300 text-sm md:text-base leading-relaxed mb-4">
                    {movieInfo.overview}
                  </p>
                  
                  <div className="h-[1px] bg-neutral-700 my-3"></div>
                  
                  {/* Movie details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center text-neutral-400 text-sm mb-2">
                        <span className="mr-2">Rating:</span>
                        {movieInfo.vote_average && (
                          <StarRatings rating={movieInfo.vote_average} showDenominator={true} />
                        )}
                      </div>
                      
                      <div className="text-neutral-400 text-sm mb-2">
                        <span>Released on: </span>
                        <span className="text-white font-medium">
                          {formatDate(movieInfo.release_date || movieInfo.first_air_date)}
                        </span>
                      </div>
                      
                      <div className="text-neutral-400 text-sm mb-2">
                        <span>Language: </span>
                        <span className="text-white font-medium">
                          {movieInfo.original_language?.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="text-neutral-400 text-sm mb-2">
                        <span>Genre: </span>
                        <span className="text-white font-medium">
                          {movieInfo.genre_ids && convertGenre(movieInfo.genre_ids).join(', ')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-4 sm:mt-0">
                      {isInMyList ? (
                        <button
                          className="flex items-center justify-center border border-white text-white font-medium py-2 px-4 rounded hover:bg-white hover:text-red-700 transition-all duration-200"
                          onClick={() => {
                            removeFromMyList(movieInfo);
                            setShowModal(false);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 mr-2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Remove
                        </button>
                      ) : (
                        <button
                          className="flex items-center justify-center border border-white text-white font-medium py-2 px-4 rounded hover:bg-white hover:text-red-700 transition-all duration-200"
                          onClick={() => {
                            addToMyList(movieInfo);
                            setShowModal(false);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 mr-2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Add to List
                        </button>
                      )}
                      
                      <button
                        className="flex items-center justify-center bg-red-700 text-white font-medium py-2 px-4 rounded hover:bg-red-800 transition-all duration-200"
                        onClick={() => setShowModal(false)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 mr-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Fade>
          </div>
        </div>
      )}
    </>
  );
}

export default MoviePopUp;
