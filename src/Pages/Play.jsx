import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import StarRatings from "../components/StarRatings";

import axios from "../axios";
import { API_KEY, imageURL, imageURL2 } from "../config/constants";

import Navbar from "../components/Header/Navbar";
import Footer from "../components/Footer/Footer";

import usePlayMovie from "../hooks/usePlayMovie";
import useUpdateMyList from "../hooks/useUpdateMyList";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function Play() {
  const [urlId, setUrlId] = useState("");
  const [movieDetails, setMovieDetails] = useState({});
  const [isFromMyList, setIsFromMyList] = useState(false);
  const [moreTrailerVideos, setMoreTrailerVideos] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);

  const { addToMyList, removeFromMyList, PopupMessage } = useUpdateMyList();
  const { playMovie } = usePlayMovie();

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (location.state?.From === "MyList") {
      setIsFromMyList(true);
    }

    axios
      .get(`/movie/${id}/videos?api_key=${API_KEY}&language=en-US`)
      .then((response) => {
        console.log(response.data, "This is the data");
        if (response.data.results.length !== 0) {
          setUrlId(response.data.results[0]);
          setMoreTrailerVideos(response.data.results);
        } else {
          console.log("Array Empty");
        }
      });

    axios
      .get(`/movie/${id}?api_key=${API_KEY}&language=en-US`)
      .then((response) => {
        console.log(response.data, "Movie details");
        setMovieDetails(response.data);
        console.log(response.data.genres[0]);

        axios
          .get(
            `movie/${id}/recommendations?api_key=${API_KEY}&language=en-US&page=1`
          )
          .then((res) => {
            console.log(
              res.data.results.slice(0, 8),
              "ksdjfk ahdsfjksadhfjsdahf"
            );
            setSimilarMovies(res.data.results.slice(0, 8));
          });
      });
  }, []);

  return (
    <div>
      <Navbar playPage></Navbar>

      {PopupMessage}

      <div className="mt-12 h-[31vh] sm:h-[42vh] md:h-[45vh] lg:h-[55vh] lg:mt-0 xl:h-[98vh]">
        {urlId ? (
          <iframe
            width="100%"
            style={{ height: "inherit" }}
            src={`//www.youtube.com/embed/${urlId.key}?modestbranding=1&autoplay=1`}
            frameBorder="0"
            allow="autoplay fullscreen"
            allowFullScreen
          ></iframe>
        ) : (
          <img src={`${imageURL + movieDetails.backdrop_path}`} />
        )}
      </div>

      {movieDetails.id ? (
        <>
          {/* Movie details Section  */}
          <section
            style={{
              backgroundImage: `linear-gradient(90deg, #000000f0 0%, #000000e6 35%, #000000c3 100%), url(${
                imageURL + movieDetails.backdrop_path
              })`,
            }}
            className="bg-cover bg-center object-contain flex flex-col p-5 sm:p-14 lg:flex-row lg:items-center lg:justify-center lg:gap-8 2xl:py-24"
          >
            <div className="lg:w-[45%]">
              <h1 className="text-white font-bold text-3xl mb-2">
                {movieDetails.original_title || movieDetails.title}
              </h1>
              <StarRatings rating={movieDetails.vote_average} />
              <p className="text-neutral-400 mt-3">{movieDetails.overview}</p>
              <div className="bg-neutral-600 w-full h-[0.1rem] my-5"></div>

              <div className="hidden lg:grid">
                <h1 className=" text-red-700 ">
                  Released on:{" "}
                  <a className="text-white ml-1">
                    {formatDate(
                      movieDetails.release_date || movieDetails.air_date
                    )}
                  </a>
                </h1>
                <h1 className="text-red-700">
                  Language:{" "}
                  <a className="text-white ml-1">
                    {movieDetails.original_language}
                  </a>
                </h1>
                <h1 className="text-red-700">
                  Genres:{" "}
                  {movieDetails.genres &&
                    movieDetails.genres.map((genre) => {
                      return (
                        <>
                          <span className="text-white ml-2">{genre.name}</span>
                        </>
                      );
                    })}
                </h1>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="lg:hidden">
                <div>
                  <h1 className=" text-red-700 text-sm leading-7 sm:text-lg sm:leading-9 lg:text-2xl lg:leading-10">
                    Released on:{" "}
                    <a className="text-white ml-2">
                      {formatDate(
                        movieDetails.release_date || movieDetails.air_date
                      )}
                    </a>
                  </h1>
                  <h1 className=" text-red-700 text-sm leading-7 sm:text-lg sm:leading-9 lg:text-2xl lg:leading-10">
                    Language:{" "}
                    <a className="text-white ml-2">
                      {movieDetails.original_language}
                    </a>
                  </h1>
                  <h1 className="text-red-700 text-sm leading-7 sm:text-lg sm:leading-9 lg:text-2xl lg:leading-10">
                    Genres:{" "}
                    {movieDetails.genres &&
                      movieDetails.genres.slice(0, 2).map((genre) => {
                        return (
                          <>
                            <span className="text-white ml-2">
                              {genre.name}
                            </span>
                          </>
                        );
                      })}
                  </h1>
                </div>
                <div>
                  <button
                    onClick={() => navigate("/")}
                    className="group flex items-center justify-center w-full bg-red-600 border-white text-white font-medium sm:font-bold text-xs sm:mt-4 sm:px-12 sm:text-lg md:px-16 md:text-xl py-3 rounded shadow hover:shadow-lg hover:bg-white hover:border-white hover:text-red-700 outline-none focus:outline-none mb-3 ease-linear transition-all duration-150"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 mr-2 ml-2"
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
              </div>
              <img
                src={
                  movieDetails.poster_path &&
                  `${
                    imageURL +
                    (window.innerWidth > 1024
                      ? movieDetails.backdrop_path
                        ? movieDetails.backdrop_path
                        : "https://i.ytimg.com/vi/Mwf--eGs05U/maxresdefault.jpg"
                      : movieDetails.poster_path)
                  }`
                }
                className="w-40 rounded-sm lg:w-[45rem] ml-4 lg:ml-0"
                alt="Movie Poster"
              />
            </div>
          </section>

          {/* Similar movies section */}
          {similarMovies.length !== 0 && (
            <section>
              <div className="flex flex-wrap justify-center bg-[#000000ac]">
                <div className="p-4 sm:p-14">
                  <h1 className="text-white text-4xl font-semibold my-10 border-l-4 border-red-800 pl-3">
                    Similar Movies
                  </h1>
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                    {similarMovies &&
                      similarMovies.map((similarMovie) => {
                        return (
                          <div className="max-w-sm shadow mb-4">
                            <img
                              src={
                                similarMovie.backdrop_path
                                  ? imageURL2 + similarMovie.backdrop_path
                                  : "https://i.ytimg.com/vi/Mwf--eGs05U/maxresdefault.jpg"
                              }
                              alt=""
                              className="cursor-pointer"
                              onClick={() => {
                                playMovie(similarMovie);
                                window.location.reload(true);
                              }}
                            />
                            <div className="p-1">
                              <h5 className="mt-1 mb-2 text-xl sm:text-2xl font-bold tracking-tight text-white dark:text-white">
                                {similarMovie.original_title ||
                                  similarMovie.title}
                              </h5>
                              <div className="flex justify-between items-center text-white mb-1">
                                <div className="flex items-center">
                                  <div className="flex sm:flex-col">
                                    <h1 className="text-green-500 text-xs lg:text-base">
                                      {Math.floor(
                                        Math.random() * (100 - 60 + 1) + 60
                                      )}
                                      % match
                                    </h1>
                                    <h1 className="text-xs lg:text-base ml-2 sm:ml-0">
                                      {similarMovie.release_date ||
                                      similarMovie.first_air_date
                                        ? formatDate(
                                            similarMovie.release_date ||
                                              similarMovie.first_air_date
                                          )
                                        : ""}
                                    </h1>
                                  </div>
                                  <h1 className="hidden sm:grid py-1 px-2 border-2 border-gray-800 rounded-md ml-2">
                                    HD
                                  </h1>
                                </div>
                              </div>
                              <p className="mb-3 font-normal text-stone-400 line-clamp-3 text-xs sm:text-base">
                                {similarMovie.overview}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <>
          <div className="px-4 lg:px-10 xl:px-12 animate-pulse">
            <div className="w-72 mt-4 sm:ml-0 sm:w-96 py-5 mb-7 xl:py-7 xl:w-45rem bg-neutral-900 rounded-md"></div>
            <div className="w-full py-1 mb-3 xl:py-2 bg-neutral-900 rounded-md"></div>
            <div className="w-full py-1 mb-3 xl:py-2 bg-neutral-900 rounded-md"></div>
            <div className="w-full py-1 mb-3 xl:py-2 bg-neutral-900 rounded-md"></div>
            <div className="w-full py-1 mb-8 xl:py-2 bg-neutral-900 rounded-md"></div>
          </div>
        </>
      )}
      <Footer></Footer>
    </div>
  );
}

export default Play;
