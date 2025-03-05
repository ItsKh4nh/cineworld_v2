import React, { useState, useEffect, useContext } from "react";

import { Fade } from "react-awesome-reveal";
import StarRatings from "../StarRatings"; // Add local StarRatings import

import { imageURL } from "../../config/constants";
import { PopUpContext } from "../../contexts/moviePopUpContext";
import useGenresConverter from "../../hooks/useGenresConverter";
import usePlayMovie from "../../hooks/usePlayMovie";
import useUpdateMyList from "../../hooks/useUpdateMyList";
import useUpdateWatchedMovies from "../../hooks/useUpdateWatchedMovies";

function MoviePopUp(props) {
  const { showModal, setShowModal } = useContext(PopUpContext);
  const { addToMyList, removeFromMyList, PopupMessage } = useUpdateMyList();
  const { removeFromWatchedMovies, removePopupMessage } =
    useUpdateWatchedMovies();
  const { playMovie } = usePlayMovie();
  const { convertGenre } = useGenresConverter();

  const [PopupInfo, setPopupInfo] = useState({});

  useEffect(() => {
    setPopupInfo(props.data1);
  }, []);

  // Add this helper function
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      {PopupMessage}
      {showModal && (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto mt-24 sm:my-6 mx-4 max-w-2xl">
              {/*content*/}
              <Fade direction="up" duration={500}>
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-neutral-800 outline-none focus:outline-none">
                  {/*header*/}
                  {/*Movie Trailer or Image*/}
                  {PopupInfo.backdrop_path ? (
                    <img src={`${imageURL + PopupInfo.backdrop_path}`} />
                  ) : null}

                  <div className="flex ml-4 items-center -mt-14">
                    <button
                      className="flex items-center justify-center bg-red-800 text-white active:bg-red-800 font-medium sm:font-bold uppercase text-xs px-4 sm:px-6 md:text-sm  py-2 rounded shadow hover:shadow-lg cursor-pointer outline-none focus:outline-none mr-3 mb-1 ease-linear transition-all duration-150"
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        playMovie(PopupInfo);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mr-1 text-white hover:text-gray-300 ease-linear transition-all duration-150"
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

                  <Fade bottom>
                    <div className="p-5 py-4 -mb-6 mt-2 sm:mb-0 sm:mt-0 sm:py-0 sm:pt-6 rounded-t">
                      <h3 className="text-3xl font-semibold text-white">
                        {PopupInfo.title || PopupInfo.name}
                      </h3>
                    </div>
                  </Fade>
                  {/*body*/}
                  <Fade bottom>
                    <div className="relative p-4 sm:p-6 flex-auto">
                      <div className="bg-neutral-700 h-[0.125rem]"></div>
                      <p className="my-4 sm:my-5 text-neutral-400 text-xs md:text-base leading-relaxed line-clamp-3 sm:line-clamp-4">
                        {PopupInfo.overview}
                      </p>
                      <div className="bg-neutral-700 h-[0.125rem]"></div>
                    </div>
                  </Fade>
                  {/*footer*/}
                  <Fade bottom>
                    <div className="sm:flex items-center justify-end p-2 rounded-b">
                      {/*More Info*/}
                      <div className="relative p-2 py-5 sm:p-6 flex-auto">
                        <h1 className="flex -mt-4 text-neutral-400 text-sm leading-relaxed">
                          Rating:
                          <div className="ml-2">
                            {PopupInfo.vote_average && (
                              <StarRatings rating={PopupInfo.vote_average} showDenominator={true} />
                            )}
                          </div>
                        </h1>
                        <h1 className="flex text-neutral-400 text-sm leading-relaxed">
                          Released on:{"  "}
                          <p className="text-white ml-2 font-medium">
                            {formatDate(
                              PopupInfo.release_date || PopupInfo.first_air_date
                            )}
                          </p>
                        </h1>
                        <h1 className="flex text-neutral-400 text-sm leading-relaxed">
                          Language:
                          <p className="text-white ml-2 font-medium">
                            {PopupInfo.original_language}
                          </p>
                        </h1>

                        <h1 className="flex text-neutral-400 text-sm leading-relaxed">
                          Genre:
                          {PopupInfo.genre_ids &&
                            convertGenre(PopupInfo.genre_ids).map((genre) => {
                              return (
                                <span className="text-white ml-2 font-medium">
                                  {genre}
                                </span>
                              );
                            })}
                        </h1>
                      </div>

                      <div className="flex justify-between p-2">
                        {props.from === "MyList" ? (
                          <button
                            className="group flex items-center justify-center border-[0.7px] border-white text-white font-medium sm:font-bold text-xs px-4 mr-4 sm:px-6 md:text-sm  py-3 rounded shadow hover:shadow-lg hover:bg-white hover:text-red-700 outline-none focus:outline-none mb-1 ease-linear transition-all duration-150"
                            type="button"
                            onClick={() => removeFromMyList(PopupInfo)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="h-6 w-6 mr-1 text-white hover:text-red-700 group-hover:text-red-700 ease-linear transition-all duration-150"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Remove from MyList
                          </button>
                        ) : (
                          <>
                            <button
                              className="group flex items-center justify-center bg-red-700 border-[0.7px] border-red-700 text-white font-medium sm:font-bold text-xs px-4 mr-4 sm:px-6 md:text-sm py-3 rounded shadow hover:shadow-lg hover:bg-white hover:text-red-700 outline-none focus:outline-none mb-1 ease-linear transition-all duration-150"
                              type="button"
                              onClick={() => setShowModal(false)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6 mr-1 text-white group-hover:text-red-700"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Close
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </Fade>
                </div>
              </Fade>
            </div>
          </div>
          <div className="opacity-40 fixed inset-0 z-40 bg-black"></div>
        </>
      )}
    </>
  );
}

export default MoviePopUp;
