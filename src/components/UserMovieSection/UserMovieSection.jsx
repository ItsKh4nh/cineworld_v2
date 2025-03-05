import React, { useContext, useEffect, useState } from "react";

import { ClipLoader } from "react-spinners";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { API_KEY, imageURL2 } from "../../config/constants";
import { db } from "../../firebase/FirebaseConfig";
import { AuthContext } from "../../contexts/UserContext";
import { PopUpContext } from "../../contexts/moviePopUpContext";
import MoviePopUp from "../PopUp/MoviePopUp";
import StarRatings from "../StarRatings";

import useGenresConverter from "../../hooks/useGenresConverter";
import usePlayMovie from "../../hooks/usePlayMovie";
import useUpdateMyList from "../../hooks/useUpdateMyList";
import useUpdateWatchedMovies from "../../hooks/useUpdateWatchedMovies";

function UserMovieSection(props) {
  const { User } = useContext(AuthContext);
  const { showModal, setShowModal } = useContext(PopUpContext);

  const { addToMyList, removeFromMyList, PopupMessage } = useUpdateMyList();
  const { removeFromWatchedMovies, removePopupMessage } =
    useUpdateWatchedMovies();
  const { playMovie } = usePlayMovie();
  const { convertGenre } = useGenresConverter();

  const [myMovies, setMyMovies] = useState([]);
  const [moviePopupInfo, setMoviePopupInfo] = useState({});
  const [title, setTitle] = useState("");
  const [isResultEmpty, setIsResultEmpty] = useState(false);

  const navigate = useNavigate();

  function getMovies() {
    getDoc(doc(db, props.from, User.uid)).then((result) => {
      const mv = result.data();
      setMyMovies(mv.movies);
      if (mv.movies.length == 0) {
        setIsResultEmpty(true);
      }
    });
  }

  useEffect(() => {
    getMovies();
    if (props.from === "MyList") {
      setTitle("Movies in MyList");
    } else if (props.from === "WatchedMovies") {
      setTitle("Watched Movies");
    }
  }, []);

  const removeMovie = (movie, event) => {
    event.stopPropagation();
    if (props.from === "MyList") {
      removeFromMyList(movie);
    } else if (props.from === "WatchedMovies") {
      removeFromWatchedMovies(movie);
    }
    getMovies();
  };

  const handleMoviePopup = (movieInfo) => {
    setMoviePopupInfo(movieInfo);
    setShowModal(true);
  };

  return (
    <div>
      {PopupMessage}

      <div className="flex justify-center">
        <h1 className="text-white pt-20 pb-6 text-5xl w-11/12 leading-snug text-center">
          {!isResultEmpty ? title : null}
        </h1>
      </div>

      <div className="grid-cols-2 grid p-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 md:p-5 space-y-1 lg:space-y-0 lg:grid lg:gap-3 lg:grid-rows-3">
        {myMovies.length !== 0 ? (
          myMovies
            .slice(0)
            .reverse()
            .map((movie) => {
              let converted;
              if (movie.genre_ids) {
                converted = convertGenre(movie.genre_ids);
              }
              return (
                <div className="p-1 mt-2 mb-5" key={movie.id}>
                  <div
                    className="hover:border-2 hover:scale-105 group relative block overflow-hidden rounded-sm transition-all duration-500"
                    onClick={() => handleMoviePopup(movie)}
                  >
                    <img
                      onClick={() => handleMoviePopup(movie)}
                      className=""
                      src={imageURL2 + movie.backdrop_path}
                    />

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
                          onClick={() => playMovie(movie, props.from)}
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

                        {/* Add to MyList or remove from MyList Button */}
                        {props.from === "MyList" ||
                        props.from === "WatchedMovies" ? (
                          <>
                            <div
                              onClick={(e) => removeMovie(movie, e)}
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
                                  d="M19.5 12h-15"
                                />
                              </svg>
                            </div>
                          </>
                        ) : (
                          <>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                addToMyList(movie);
                              }}
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
                                  d="M12 4.5v15m7.5-7.5h-15"
                                />
                              </svg>
                            </div>
                          </>
                        )}

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
                      {props.from === "WatchedMovies" && movie.userRating?.dateAdded && (
                        <div className="text-white text-xs 2xl:text-sm font-thin mb-1">
                          Watched on: {new Date(movie.userRating.dateAdded).toLocaleDateString()}
                        </div>
                      )}
                      <br></br>
                      <div className="mt-1">
                        {converted &&
                          converted.map((genre, index) => {
                            return (
                              <span
                                key={`${movie.id}-${index}`}
                                className="text-white mr-4 text-xs  2xl:text-sm font-thin"
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
              <div className="w-[100vw] h-[70vh] flex justify-center items-center">
                {!isResultEmpty ? (
                  <ClipLoader color="#ff0000" size={160} />
                ) : (
                  <div>
                    <h1 className="text-white text-5xl text-center">
                      No Movies Present
                    </h1>
                    <br></br>
                    <button
                      onClick={() => {
                        navigate("/");
                      }}
                      className="flex justify-center items-center w-11/12 ml-2 bg-red-700 text-white font-medium sm:font-bold text-xl px-16 md:text-xl  py-3 rounded shadow hover:shadow-lg hover:bg-red-900 outline-none focus:outline-none mr-3 mb-1 ease-linear transition-all duration-150"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 mr-2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                        />
                      </svg>
                      Back to Home
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      {showModal ? (
        <MoviePopUp data1={moviePopupInfo} from={props.from} />
      ) : null}
    </div>
  );
}

export default UserMovieSection;
