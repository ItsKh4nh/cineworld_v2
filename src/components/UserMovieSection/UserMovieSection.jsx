import React, { useContext, useEffect, useState } from "react";

import { ClipLoader } from "react-spinners";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { API_KEY, imageURL2 } from "../../config/constants";
import { db } from "../../firebase/FirebaseConfig";
import { AuthContext } from "../../contexts/UserContext";
import { PopUpContext } from "../../contexts/moviePopUpContext";
import StarRatings from "../StarRatings";

import useGenresConverter from "../../hooks/useGenresConverter";
import usePlayMovie from "../../hooks/usePlayMovie";
import useUpdateMyList from "../../hooks/useUpdateMyList";
import useMoviePopup from "../../hooks/useMoviePopup";

function UserMovieSection(props) {
  const { User } = useContext(AuthContext);
  const { showModal } = useContext(PopUpContext);

  const { addToMyList, removeFromMyList, PopupMessage } = useUpdateMyList();
  const { playMovie } = usePlayMovie();
  const { convertGenre } = useGenresConverter();
  const { handleMoviePopup } = useMoviePopup();

  const [myMovies, setMyMovies] = useState([]);
  const [isResultEmpty, setIsResultEmpty] = useState(false);
  const [title, setTitle] = useState("");

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
    }
    getMovies();
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
                      <div className="flex transition ease-in-out delay-150">
                        {/* Play Button */}
                        <div
                          onClick={() => playMovie(movie)}
                          className="text-white w-10 h-10 2xl:w-14 2xl:h-14 border-[2px] 2xl:border-[3px] rounded-full flex items-center justify-center mr-2 backdrop-blur-[1px] shadow-md ease-linear transition-all duration-150 hover:border-red-600 hover:text-red-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6 2xl:w-8 2xl:h-8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                            />
                          </svg>
                        </div>

                        {/* Add to MyList or remove from MyList Button */}
                        {movie.isInMyList ? (
                          <>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                // This would be replaced with an edit function in the future
                                // For now, we'll keep the removeFromMyList function as a placeholder
                                removeFromMyList(movie);
                              }}
                              className="bg-cineworldYellow text-white w-10 h-10 2xl:w-14 2xl:h-14 rounded-full flex items-center justify-center mr-2 backdrop-blur-[1px] shadow-md ease-linear transition-all duration-150 hover:bg-white hover:text-cineworldYellow"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6 2xl:w-8 2xl:h-8"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
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
                              className="text-white w-10 h-10 2xl:w-14 2xl:h-14 border-[2px] 2xl:border-[3px] rounded-full flex items-center justify-center mr-2 backdrop-blur-[1px] shadow-md ease-linear transition-all duration-150 hover:border-red-600 hover:text-red-600"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6 2xl:w-8 2xl:h-8"
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
                                key={`