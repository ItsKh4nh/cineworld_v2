import React, { useEffect, useState, useRef, useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "../axios";
import {
  movieVideos,
  movieDetails as getMovieDetails,
  movieRecommendations,
  collectionDetails,
  movieExternalIds,
  movieKeywords,
  movieReviews,
  configurationLanguages,
} from "../config";
import { imageURL, imageURL2, languageList } from "../config";
import Navbar from "../components/Header/Navbar";
import Footer from "../components/Footer/Footer";
import usePlayMovie from "../hooks/usePlayMovie";
import useUpdateMyList from "../hooks/useUpdateMyList";
import useGenresConverter from "../hooks/useGenresConverter";
import useMoviePopup from "../hooks/useMoviePopup";
import { ClipLoader } from "react-spinners";
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  FaImdb,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaWikipediaW,
} from "react-icons/fa";
import StarRating from "../components/StarRating/StarRating";
import { AuthContext } from "../contexts/UserContext";
import { formatDate, formatMoney, formatRuntime } from "../utils";

// Icons
import StarIcon from "../assets/star-icon.svg?react";
import EditIcon from "../assets/edit-icon.svg?react";
import AddIcon from "../assets/add-icon.svg?react";
import PlaySolidIcon from "../assets/play-solid-icon.svg?react";
import PlayIcon from "../assets/play-icon.svg?react";

function Play() {
  // State variables
  const [urlId, setUrlId] = useState("");
  const [activeVideo, setActiveVideo] = useState(null);
  const [movieDetails, setMovieDetails] = useState({});
  const [isFromMyList, setIsFromMyList] = useState(false);
  const [trailerVideos, setTrailerVideos] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [collectionInfo, setCollectionInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [isInMyList, setIsInMyList] = useState(false);
  const [movieSource, setMovieSource] = useState(null);
  const [externalIds, setExternalIds] = useState({});
  const [keywords, setKeywords] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [languages, setLanguages] = useState({});
  const [hasInteracted, setHasInteracted] = useState(false);
  const videoRef = useRef(null);

  // Hooks
  const { User } = useContext(AuthContext);
  const { addToMyList, removeFromMyList, PopupMessage, checkIfInMyList } =
    useUpdateMyList();
  const { playMovie } = usePlayMovie();
  const { convertGenre } = useGenresConverter();
  const { handleMoviePopup } = useMoviePopup();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Track movie interaction directly to avoid circular dependency
  const trackMovieInteraction = async (movie_id) => {
    try {
      if (!User || !User.uid) return false;

      const movie_id_number =
        typeof movie_id === "string" ? parseInt(movie_id) : movie_id;

      // Reference to the user's interaction list document
      const interactionDocRef = doc(db, "InteractionList", User.uid);
      const docSnap = await getDoc(interactionDocRef);

      if (docSnap.exists()) {
        // Document exists, check if movie_id is already in the list
        const userData = docSnap.data();
        const movieIds = userData.movie_ids || [];

        // Only add if not already in the list
        if (!movieIds.includes(movie_id_number)) {
          await updateDoc(interactionDocRef, {
            movie_ids: arrayUnion(movie_id_number),
            lastUpdated: new Date().toISOString(),
          });
        }
      } else {
        // Document doesn't exist, create it
        await setDoc(interactionDocRef, {
          movie_ids: [movie_id_number],
          lastUpdated: new Date().toISOString(),
        });
      }

      return true;
    } catch (error) {
      console.error("Error tracking movie interaction:", error);
      return false;
    }
  };

  // Track user interaction with video player
  const handlePlayerInteraction = () => {
    if (!hasInteracted) {
      trackMovieInteraction(id);
      setHasInteracted(true);
    }
  };

  // Check movie source
  const checkMovieSource = async () => {
    try {
      const movieSourceRef = doc(db, "MovieSources", id);
      const movieSourceDoc = await getDoc(movieSourceRef);

      if (movieSourceDoc.exists()) {
        const sourceData = movieSourceDoc.data();
        if (sourceData.link_embed_1) {
          setMovieSource(sourceData.link_embed_1);
          // If we have a direct source, don't load YouTube trailer
          setUrlId("");
        } else if (sourceData.link_m3u8_1) {
          setMovieSource(sourceData.link_m3u8_1);
          setUrlId("");
        }
      }
    } catch (error) {
      console.error("Error checking movie source:", error);
    }
  };

  const formatLanguage = (languageCode) => {
    if (!languageCode) return "N/A";

    // First check our languages object from the API
    if (languages[languageCode]) {
      return languages[languageCode];
    }

    // Fall back to our predefined map
    if (languageList[languageCode]) {
      return languageList[languageCode];
    }

    // If no match found, return the code in uppercase
    return languageCode.toUpperCase();
  };

  // Scroll to video on play
  const scrollToVideo = () => {
    if (videoRef.current) {
      videoRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Check if movie is in user's list
  const checkMovieInList = async () => {
    const result = await checkIfInMyList(id);
    setIsInMyList(result);
  };

  // Data fetching
  useEffect(() => {
    // Scroll to top when navigating to a new movie
    window.scrollTo(0, 0);

    // Reset states
    setUrlId("");
    setActiveVideo(null);
    setMovieDetails({});
    setTrailerVideos([]);
    setSimilarMovies([]);
    setCollectionInfo(null);
    setLoading(true);
    setMovieSource(null);
    setExternalIds({});
    setKeywords([]);
    setReviews([]);

    if (location.state?.From === "MyList") {
      setIsFromMyList(true);
    }

    // Check if movie is in MyList
    checkMovieInList();

    // Check for direct movie sources
    checkMovieSource();

    // Fetch language configurations if not already loaded
    if (Object.keys(languages).length === 0) {
      axios
        .get(configurationLanguages)
        .then((response) => {
          // Convert array to object with ISO_639_1 as keys
          const languagesObj = {};
          response.data.forEach((lang) => {
            languagesObj[lang.iso_639_1] = lang.english_name;
          });
          setLanguages(languagesObj);
        })
        .catch((error) => {
          console.error("Error fetching languages:", error);
        });
    }

    // Fetch trailer videos
    axios
      .get(movieVideos(id))
      .then((response) => {
        if (response.data.results.length !== 0) {
          // Set the first trailer as the active video for the page header
          const trailers = response.data.results.filter(
            (video) => video.type === "Trailer" || video.type === "Teaser"
          );
          if (trailers.length > 0) {
            // Only set these for initial page load autoplay
            // This won't affect the video tab click behavior
            setActiveVideo(trailers[0]);
            setUrlId(trailers[0].key);
          }
          setTrailerVideos(response.data.results);
        }
      })
      .catch((error) => {
        console.error("Error fetching videos:", error);
      });

    // Fetch movie details
    axios
      .get(getMovieDetails(id))
      .then((response) => {
        setMovieDetails(response.data);

        // Fetch collection details
        if (response.data.belongs_to_collection) {
          axios
            .get(collectionDetails(response.data.belongs_to_collection.id))
            .then((collectionResponse) => {
              const processedCollection = {
                ...collectionResponse.data,
              };

              // Mark each movie in collection to check if it's in user's list
              if (User && User.uid) {
                // Check each movie in the collection
                const checkPromises = processedCollection.parts.map(
                  async (movie) => {
                    const isInList = await checkIfInMyList(movie.id);
                    return { ...movie, isInMyList: isInList };
                  }
                );

                // Wait for all checks to complete
                Promise.all(checkPromises).then((updatedParts) => {
                  processedCollection.parts = updatedParts;
                  setCollectionInfo(processedCollection);
                });
              } else {
                setCollectionInfo(processedCollection);
              }
            })
            .catch((error) => {
              console.error("Error fetching collection:", error);
            });
        }

        // Fetch external IDs (IMDB, social media, etc.)
        axios
          .get(movieExternalIds(id))
          .then((externalResponse) => {
            setExternalIds(externalResponse.data);
          })
          .catch((error) => {
            console.error("Error fetching external IDs:", error);
          });

        // Fetch movie keywords
        axios
          .get(movieKeywords(id))
          .then((keywordsResponse) => {
            setKeywords(keywordsResponse.data.keywords || []);
          })
          .catch((error) => {
            console.error("Error fetching keywords:", error);
          });

        // Fetch movie reviews
        axios
          .get(movieReviews(id))
          .then((reviewsResponse) => {
            setReviews(reviewsResponse.data.results || []);
          })
          .catch((error) => {
            console.error("Error fetching reviews:", error);
          });

        // Fetch similar movies
        axios
          .get(movieRecommendations(id))
          .then((res) => {
            const recommendedMovies = res.data.results.slice(0, 20);

            // Check which movies are in the user's list and filter them out
            if (User && User.uid) {
              const checkPromises = recommendedMovies.map(async (movie) => {
                const isInList = await checkIfInMyList(movie.id);
                return { ...movie, isInMyList: isInList };
              });

              Promise.all(checkPromises).then((checkedMovies) => {
                // Filter out movies already in MyList
                const filteredMovies = checkedMovies.filter(
                  (movie) => !movie.isInMyList
                );
                // Take the first 10 after filtering
                setSimilarMovies(filteredMovies.slice(0, 10));
                setLoading(false);
              });
            } else {
              setSimilarMovies(recommendedMovies.slice(0, 10));
              setLoading(false);
            }
          })
          .catch((error) => {
            console.error("Error fetching recommendations:", error);
            setLoading(false);
          });
      })
      .catch((error) => {
        console.error("Error fetching movie details:", error);
        setLoading(false);
      });
  }, [id]);

  // Check if movie is in user's list and handle collection movies
  useEffect(() => {
    if (!loading) {
      checkMovieInList();

      // Check if collection movies are in the user's list
      if (collectionInfo && collectionInfo.parts) {
        const checkCollectionMovies = async () => {
          for (const movie of collectionInfo.parts) {
            const isInList = await checkIfInMyList(movie.id);
            movie.isInMyList = isInList;
          }
          // Force a re-render
          setCollectionInfo({ ...collectionInfo });
        };

        checkCollectionMovies();
      }
    }
  }, [PopupMessage]);

  // Handle movie list actions
  const handleMyListAction = () => {
    if (isInMyList) {
      removeFromMyList(movieDetails).then((result) => {
        if (result) {
          setIsInMyList(false);
        }
      });
    } else {
      addToMyList(movieDetails).then((result) => {
        if (result) {
          setIsInMyList(true);
        }
      });
    }
  };

  // Handle video selection
  const handleVideoSelect = (video) => {
    // Open the video directly in YouTube in a new tab
    window.open(`https://www.youtube.com/watch?v=${video.key}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <Navbar playPage />
      {PopupMessage}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <ClipLoader color="#E50914" size={60} />
          <p className="mt-4 text-xl">Loading movie details...</p>
        </div>
      ) : (
        <>
          {/* Hero Section with Video/Backdrop */}
          <div
            ref={videoRef}
            className="relative w-full h-[30vh] sm:h-[40vh] md:h-[50vh] lg:h-[65vh] xl:h-[85vh] bg-black"
            onClick={handlePlayerInteraction}
          >
            {movieSource ? (
              <div className="relative w-full h-full">
                <iframe
                  src={movieSource}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            ) : urlId ? (
              <div className="relative w-full h-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={`//www.youtube.com/embed/${urlId}?modestbranding=1&autoplay=1`}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            ) : (
              <div
                className="w-full h-full bg-cover bg-center flex items-end"
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8)), url(${
                    imageURL + movieDetails.backdrop_path
                  })`,
                }}
              >
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                    {movieDetails.title || movieDetails.original_title}
                  </h1>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-4 py-6 -mt-6 relative z-10">
            {/* Info Bar */}
            <div className="flex flex-wrap gap-4 items-center mb-6 bg-gray-900 bg-opacity-70 backdrop-blur-sm p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex items-center">
                  <StarIcon
                    fill={
                      movieDetails.vote_average <= 2
                        ? "#ff4545" // Red
                        : movieDetails.vote_average <= 4
                        ? "#ffa534" // Orange
                        : movieDetails.vote_average <= 6
                        ? "#ffe234" // Yellow
                        : movieDetails.vote_average <= 8
                        ? "#b7dd29" // Light green
                        : "#57e32c" // Bright green
                    }
                    className="w-7 h-7 mr-2"
                    aria-hidden="true"
                  />
                  <span className="text-base text-white">
                    <span className="font-bold">
                      {movieDetails.vote_average
                        ? parseFloat(movieDetails.vote_average.toFixed(2))
                        : "N/A"}
                    </span>
                    <span>/10 </span>
                    <span className="text-sm text-gray-300">
                      (
                      {movieDetails.vote_count
                        ? movieDetails.vote_count.toLocaleString()
                        : "0"}{" "}
                      Votes)
                    </span>
                  </span>
                </div>
              </div>

              <div className="h-6 border-l border-gray-500"></div>

              <div className="flex items-center">
                <span className="font-medium text-gray-400 mr-2">
                  Released:
                </span>
                <span className="text-sm md:text-base">
                  {formatDate(movieDetails.release_date)}
                </span>
              </div>

              <div className="h-6 border-l border-gray-500"></div>

              <div className="flex items-center">
                <span className="font-medium text-gray-400 mr-2">Runtime:</span>
                <span className="text-sm md:text-base">
                  {formatRuntime(movieDetails.runtime)}
                </span>
              </div>

              {movieDetails.adult && (
                <>
                  <div className="h-6 border-l border-gray-500"></div>
                  <div className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                    18+
                  </div>
                </>
              )}

              <div className="ml-auto flex gap-2">
                <button
                  onClick={handleMyListAction}
                  className={`flex items-center justify-center px-3 py-1 rounded-full ${
                    isInMyList
                      ? "bg-yellow-600 hover:bg-yellow-500"
                      : "bg-yellow-600 hover:bg-yellow-500"
                  } transition-colors`}
                >
                  {isInMyList ? (
                    <>
                      <EditIcon className="h-5 w-5 mr-1" />
                      Update Your Rating
                    </>
                  ) : (
                    <>
                      <AddIcon className="h-5 w-5 mr-1" />
                      Add to MyList
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Movie Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Left Column - Poster */}
              <div className="hidden lg:block">
                <img
                  src={`${imageURL2}${movieDetails.poster_path}`}
                  alt={movieDetails.title}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>

              {/* Center/Right Columns - Details & Tabs */}
              <div className="lg:col-span-2">
                {/* Tabs Navigation */}
                <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
                  <button
                    className={`px-4 py-2 font-medium ${
                      activeTab === "overview"
                        ? "text-yellow-500 border-b-2 border-yellow-500"
                        : "text-gray-400 hover:text-white"
                    }`}
                    onClick={() => setActiveTab("overview")}
                  >
                    Overview
                  </button>
                  <button
                    className={`px-4 py-2 font-medium ${
                      activeTab === "videos"
                        ? "text-yellow-500 border-b-2 border-yellow-500"
                        : "text-gray-400 hover:text-white"
                    }`}
                    onClick={() => setActiveTab("videos")}
                  >
                    Videos
                  </button>
                  <button
                    className={`px-4 py-2 font-medium ${
                      activeTab === "cast"
                        ? "text-yellow-500 border-b-2 border-yellow-500"
                        : "text-gray-400 hover:text-white"
                    }`}
                    onClick={() => setActiveTab("cast")}
                  >
                    Cast & Crew
                  </button>
                  <button
                    className={`px-4 py-2 font-medium ${
                      activeTab === "reviews"
                        ? "text-yellow-500 border-b-2 border-yellow-500"
                        : "text-gray-400 hover:text-white"
                    }`}
                    onClick={() => setActiveTab("reviews")}
                  >
                    Reviews
                  </button>
                  {collectionInfo && (
                    <button
                      className={`px-4 py-2 font-medium ${
                        activeTab === "collection"
                          ? "text-yellow-500 border-b-2 border-yellow-500"
                          : "text-gray-400 hover:text-white"
                      }`}
                      onClick={() => setActiveTab("collection")}
                    >
                      Collection
                    </button>
                  )}
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                  {/* Overview Tab */}
                  {activeTab === "overview" && (
                    <div>
                      <div className="lg:hidden mb-6 flex justify-center">
                        <img
                          src={`${imageURL2}${movieDetails.poster_path}`}
                          alt={movieDetails.title}
                          className="w-1/2 rounded-lg shadow-lg"
                        />
                      </div>

                      <h1 className="text-2xl font-bold mb-4">
                        {movieDetails.title || movieDetails.original_title}
                      </h1>

                      <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">
                          Storyline
                        </h2>
                        <p className="text-gray-300 leading-relaxed">
                          {movieDetails.overview || "No overview available."}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Basic Details */}
                        <div>
                          <h2 className="text-xl font-semibold mb-4">
                            Details
                          </h2>

                          <div className="space-y-2">
                            {movieDetails.original_title &&
                              movieDetails.original_title !==
                                movieDetails.title && (
                                <div className="flex">
                                  <span className="w-32 text-gray-400">
                                    Original Title:
                                  </span>
                                  <span>{movieDetails.original_title}</span>
                                </div>
                              )}

                            <div className="flex">
                              <span className="w-32 text-gray-400">
                                Status:
                              </span>
                              <span>{movieDetails.status}</span>
                            </div>

                            {movieDetails.tagline && (
                              <div className="flex">
                                <span className="w-32 text-gray-400">
                                  Tagline:
                                </span>
                                <span>{movieDetails.tagline}</span>
                              </div>
                            )}

                            <div className="flex">
                              <span className="w-32 text-gray-400">
                                Budget:
                              </span>
                              <span>{formatMoney(movieDetails.budget)}</span>
                            </div>

                            <div className="flex">
                              <span className="w-32 text-gray-400">
                                Revenue:
                              </span>
                              <span>{formatMoney(movieDetails.revenue)}</span>
                            </div>

                            {movieDetails.production_countriesList?.length >
                              0 && (
                              <div className="flex">
                                <span className="w-32 text-gray-400">
                                  Production countriesList:
                                </span>
                                <span>
                                  {movieDetails.production_countriesList
                                    .map((country) => country.name)
                                    .join(", ")}
                                </span>
                              </div>
                            )}

                            <div className="flex">
                              <span className="w-32 text-gray-400">
                                Original Language:
                              </span>
                              <span>
                                {formatLanguage(movieDetails.original_language)}
                              </span>
                            </div>

                            {movieDetails.spoken_languages?.length > 0 && (
                              <div className="flex">
                                <span className="w-32 text-gray-400">
                                  Spoken Languages:
                                </span>
                                <span>
                                  {movieDetails.spoken_languages
                                    .map((lang) =>
                                      formatLanguage(lang.iso_639_1)
                                    )
                                    .join(", ")}
                                </span>
                              </div>
                            )}

                            {movieDetails.homepage && (
                              <div className="flex items-center">
                                <span className="w-32 text-gray-400">
                                  Homepage:
                                </span>
                                <a
                                  href={movieDetails.homepage}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline"
                                >
                                  Official Website
                                </a>
                              </div>
                            )}

                            {/* Social Media Links Section */}
                            {(externalIds.imdb_id ||
                              externalIds.facebook_id ||
                              externalIds.instagram_id ||
                              externalIds.twitter_id ||
                              externalIds.wikidata_id) && (
                              <div className="mt-4 mb-2">
                                <h3 className="text-lg font-semibold text-white mb-2">
                                  Follow on Social Media
                                </h3>
                                <div className="flex space-x-4">
                                  {externalIds.imdb_id && (
                                    <a
                                      href={`https://imdb.com/title/${externalIds.imdb_id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:opacity-80 transition-opacity"
                                      title="IMDb"
                                    >
                                      <FaImdb className="text-yellow-400 text-3xl" />
                                    </a>
                                  )}

                                  {externalIds.facebook_id && (
                                    <a
                                      href={`https://www.facebook.com/${externalIds.facebook_id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:opacity-80 transition-opacity"
                                      title="Facebook"
                                    >
                                      <FaFacebook className="text-[#1877F2] text-3xl" />
                                    </a>
                                  )}

                                  {externalIds.instagram_id && (
                                    <a
                                      href={`https://www.instagram.com/${externalIds.instagram_id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:opacity-80 transition-opacity"
                                      title="Instagram"
                                    >
                                      <FaInstagram className="text-[#E4405F] text-3xl" />
                                    </a>
                                  )}

                                  {externalIds.twitter_id && (
                                    <a
                                      href={`https://twitter.com/${externalIds.twitter_id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:opacity-80 transition-opacity"
                                      title="Twitter"
                                    >
                                      <FaTwitter className="text-[#1DA1F2] text-3xl" />
                                    </a>
                                  )}

                                  {externalIds.wikidata_id && (
                                    <a
                                      href={`https://www.wikidata.org/wiki/${externalIds.wikidata_id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:opacity-80 transition-opacity"
                                      title="Wikidata"
                                    >
                                      <FaWikipediaW className="text-gray-200 text-3xl" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Genres & Tags */}
                        <div>
                          <h2 className="text-xl font-semibold mb-4">Genres</h2>

                          <div className="flex flex-wrap gap-2 mb-6">
                            {movieDetails.genres?.map((genre) => (
                              <span
                                key={genre.id}
                                className="bg-gray-800 px-3 py-1 rounded-full text-sm"
                              >
                                {genre.name}
                              </span>
                            ))}
                          </div>

                          {keywords?.length > 0 && (
                            <>
                              <h2 className="text-xl font-semibold mb-4 mt-8">
                                Keywords
                              </h2>
                              <div className="flex flex-wrap gap-2 mb-6">
                                {keywords.map((keyword) => (
                                  <span
                                    key={keyword.id}
                                    className="bg-gray-700 px-3 py-1 rounded-full text-xs"
                                  >
                                    {keyword.name}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}

                          {movieDetails.production_companies?.length > 0 && (
                            <>
                              <h2 className="text-xl font-semibold mb-4 mt-8">
                                Production
                              </h2>
                              <div className="flex flex-wrap gap-4">
                                {movieDetails.production_companies.map(
                                  (company) => (
                                    <div
                                      key={company.id}
                                      className="flex flex-col items-center text-center max-w-[150px]"
                                    >
                                      {company.logo_path ? (
                                        <img
                                          src={`${imageURL2}${company.logo_path}`}
                                          alt={company.name}
                                          className="h-12 mb-2 bg-white p-1 rounded"
                                        />
                                      ) : (
                                        <div className="h-12 mb-2 flex items-center justify-center">
                                          <span className="text-sm text-gray-400">
                                            [No Logo]
                                          </span>
                                        </div>
                                      )}
                                      <span className="text-sm text-center">
                                        {company.name}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Videos Tab */}
                  {activeTab === "videos" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">
                        Videos & Trailers
                      </h2>

                      {trailerVideos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {trailerVideos.map((video) => (
                            <div
                              key={video.id}
                              className={`cursor-pointer group relative ${
                                activeVideo?.id === video.id
                                  ? "ring-2 ring-yellow-500"
                                  : ""
                              }`}
                              onClick={() => handleVideoSelect(video)}
                            >
                              <div className="relative aspect-video">
                                <img
                                  src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                                  alt={video.name}
                                  className="w-full h-full object-cover rounded"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <PlaySolidIcon className="w-12 h-12 text-red-600" />
                                  <span className="text-white text-sm mt-2">
                                    Open in YouTube
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="font-medium text-sm truncate">
                                  {video.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {video.type}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">
                          No videos available for this movie.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Cast & Crew Tab */}
                  {activeTab === "cast" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Cast</h2>

                      {movieDetails.credits?.cast?.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                          {movieDetails.credits.cast
                            .slice(0, 10)
                            .map((person) => (
                              <div
                                key={person.id}
                                className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => navigate(`/people/${person.id}`)}
                              >
                                <div className="aspect-square rounded-full overflow-hidden mb-2 mx-auto w-20 h-20">
                                  <img
                                    src={
                                      person.profile_path
                                        ? `${imageURL2}${person.profile_path}`
                                        : "/placeholder.jpg"
                                    }
                                    alt={person.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="font-medium text-sm">
                                  {person.name}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  {person.character}
                                </p>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 mb-8">
                          No cast information available.
                        </p>
                      )}

                      <h2 className="text-xl font-semibold mb-4">Crew</h2>

                      {movieDetails.credits?.crew?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {/* Group the crew by their primary roles */}
                          {[
                            { title: "Directors", jobs: ["Director"] },
                            {
                              title: "Writers",
                              jobs: ["Screenplay", "Writer", "Story", "Script"],
                            },
                            {
                              title: "Producers",
                              jobs: ["Producer", "Executive Producer"],
                            },
                          ].map((roleGroup) => {
                            // Filter crew by the specified job roles
                            const crewInRole = movieDetails.credits.crew.filter(
                              (person) => roleGroup.jobs.includes(person.job)
                            );

                            // Only display non-empty role groups
                            return crewInRole.length > 0 ? (
                              <div key={roleGroup.title} className="mb-4">
                                <h3 className="text-lg font-medium text-yellow-500 mb-2">
                                  {roleGroup.title}
                                </h3>
                                {crewInRole.map((person) => (
                                  <div
                                    key={`${person.id}-${person.job}`}
                                    className="flex items-center mb-2 cursor-pointer hover:bg-gray-800 rounded p-1 transition-colors"
                                    onClick={() =>
                                      navigate(`/people/${person.id}`)
                                    }
                                  >
                                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                                      <img
                                        src={
                                          person.profile_path
                                            ? `${imageURL2}${person.profile_path}`
                                            : "/placeholder.jpg"
                                        }
                                        alt={person.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">
                                        {person.name}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {person.job}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-400">
                          No crew information available.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Reviews Tab */}
                  {activeTab === "reviews" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6">
                        Critics Reviews
                      </h2>

                      {reviews?.length > 0 ? (
                        <div className="space-y-6">
                          {reviews.map((review) => (
                            <div
                              key={review.id}
                              className="bg-gray-800 rounded-lg p-4"
                            >
                              <div className="flex items-center mb-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                                  {review.author_details?.avatar_path ? (
                                    <img
                                      src={
                                        review.author_details.avatar_path.startsWith(
                                          "/"
                                        ) &&
                                        !review.author_details.avatar_path.startsWith(
                                          "/https:"
                                        )
                                          ? `${imageURL2}${review.author_details.avatar_path}`
                                          : review.author_details.avatar_path.replace(
                                              /^\//,
                                              ""
                                            )
                                      }
                                      alt={review.author}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/favicon.png";
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                      <img
                                        src="/favicon.png"
                                        alt="User"
                                        className="w-8 h-8"
                                      />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold">
                                    {review.author}
                                  </p>
                                  <div className="flex items-center">
                                    {review.author_details?.rating && (
                                      <div className="mr-3 flex items-center">
                                        <StarRating
                                          rating={review.author_details.rating}
                                          size="small"
                                          showDenominator={true}
                                        />
                                      </div>
                                    )}
                                    <span className="text-sm text-gray-400">
                                      {formatDate(
                                        review.updated_at || review.created_at
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="review-content">
                                <p className="text-gray-300 leading-relaxed line-clamp-4">
                                  {review.content}
                                </p>
                                {review.content.length > 300 && (
                                  <button
                                    className="text-blue-400 hover:underline mt-2"
                                    onClick={(e) => {
                                      const content = e.target.parentElement;
                                      content
                                        .querySelector("p")
                                        .classList.toggle("line-clamp-4");
                                      e.target.textContent =
                                        e.target.textContent === "Read more"
                                          ? "Show less"
                                          : "Read more";
                                    }}
                                  >
                                    Read more
                                  </button>
                                )}
                              </div>
                              {review.url && (
                                <div className="mt-2">
                                  <a
                                    href={review.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-400 hover:underline"
                                  >
                                    Read full review
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">
                          No reviews available for this movie.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Collection Tab */}
                  {activeTab === "collection" && collectionInfo && (
                    <div>
                      <div
                        className="w-full h-40 bg-cover bg-center rounded-lg mb-6"
                        style={{
                          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8)), url(${imageURL}${collectionInfo.backdrop_path})`,
                        }}
                      >
                        <div className="h-full flex items-center p-6">
                          <h2 className="text-2xl font-bold">
                            {collectionInfo.name}
                          </h2>
                        </div>
                      </div>

                      <p className="text-gray-300 mb-6">
                        {collectionInfo.overview}
                      </p>

                      <h3 className="text-xl font-semibold mb-4">
                        Movies in this collection
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {collectionInfo.parts.map((movie) => (
                          <div
                            key={movie.id}
                            className={`cursor-pointer relative group bg-zinc-900 rounded-lg overflow-hidden ${
                              movie.id === parseInt(id)
                                ? "ring-2 ring-yellow-500"
                                : ""
                            }`}
                            onClick={() => handleMoviePopup(movie)}
                          >
                            {/* Movie poster/backdrop */}
                            <div className="relative aspect-video">
                              <img
                                className="w-full h-full object-cover"
                                src={
                                  movie.backdrop_path
                                    ? imageURL2 + movie.backdrop_path
                                    : "/placeholder.jpg"
                                }
                                alt={movie.title || movie.name}
                                loading="lazy"
                              />

                              {/* Play and Add buttons - always visible at top left */}
                              <div className="absolute top-2 left-2 flex space-x-2">
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playMovie(movie);
                                    window.location.reload();
                                  }}
                                  className="text-white w-8 h-8 border-2 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md hover:text-black hover:bg-white transition-all duration-150"
                                >
                                  <PlayIcon className="w-4 h-4" />
                                </div>

                                {movie.isInMyList ? (
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToMyList(movie);
                                    }}
                                    className="bg-cineworldYellow text-white w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md hover:bg-white hover:text-cineworldYellow transition-all duration-150"
                                  >
                                    <EditIcon className="w-4 h-4" />
                                  </div>
                                ) : (
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToMyList(movie);
                                    }}
                                    className="text-white w-8 h-8 border-2 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md hover:text-black hover:bg-white transition-all duration-150"
                                  >
                                    <AddIcon className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Movie details */}
                            <div className="p-3">
                              {/* Movie title */}
                              <h2 className="text-white text-lg font-bold mb-1 line-clamp-1">
                                {movie.title || movie.name}
                              </h2>

                              {/* Release date */}
                              <p className="text-white/80 text-sm mb-2">
                                {movie.release_date
                                  ? new Date(
                                      movie.release_date
                                    ).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : "Release date unknown"}
                              </p>

                              {/* Star rating with number */}
                              <div className="flex items-center mb-3">
                                <StarRating rating={movie.vote_average} />
                              </div>

                              {/* Genres */}
                              <div className="flex flex-wrap gap-2">
                                {movie.genre_ids && movie.genre_ids.length > 0
                                  ? convertGenre(movie.genre_ids).map(
                                      (genre, idx) => (
                                        <span
                                          key={idx}
                                          className="text-white/80 text-sm flex items-center"
                                        >
                                          {idx > 0 && (
                                            <span className="mr-2">•</span>
                                          )}
                                          {genre}
                                        </span>
                                      )
                                    )
                                  : null}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Similar Movies Section */}
            {similarMovies.length > 0 && (
              <section className="mt-12 mb-8">
                <h2 className="text-2xl font-bold mb-6 border-l-4 border-yellow-500 pl-3">
                  Recommended Movies
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {similarMovies.map((movie) => (
                    <div
                      key={movie.id}
                      className="cursor-pointer relative group bg-zinc-900 rounded-lg overflow-hidden"
                      onClick={() => handleMoviePopup(movie)}
                    >
                      {/* Movie poster/backdrop */}
                      <div className="relative aspect-video">
                        <img
                          className="w-full h-full object-cover"
                          src={
                            movie.backdrop_path
                              ? imageURL2 + movie.backdrop_path
                              : "/placeholder.jpg"
                          }
                          alt={movie.title || movie.name}
                          loading="lazy"
                        />

                        {/* Play and Add buttons - always visible at top left */}
                        <div className="absolute top-2 left-2 flex space-x-2">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              playMovie(movie);
                              window.location.reload();
                            }}
                            className="text-white w-8 h-8 border-2 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md hover:text-black hover:bg-white transition-all duration-150"
                          >
                            <PlayIcon className="w-4 h-4" />
                          </div>

                          {movie.isInMyList ? (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                addToMyList(movie);
                              }}
                              className="bg-cineworldYellow text-white w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md hover:bg-white hover:text-cineworldYellow transition-all duration-150"
                            >
                              <EditIcon className="w-4 h-4" />
                            </div>
                          ) : (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                addToMyList(movie);
                              }}
                              className="text-white w-8 h-8 border-2 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md hover:text-black hover:bg-white transition-all duration-150"
                            >
                              <AddIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Movie details */}
                      <div className="p-3">
                        {/* Movie title */}
                        <h2 className="text-white text-lg font-bold mb-1 line-clamp-1">
                          {movie.title || movie.name}
                        </h2>

                        {/* Release date */}
                        <p className="text-white/80 text-sm mb-2">
                          {movie.release_date
                            ? new Date(movie.release_date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "Release date unknown"}
                        </p>

                        {/* Star rating with number */}
                        <div className="flex items-center mb-3">
                          <StarRating rating={movie.vote_average} />
                        </div>

                        {/* Genres */}
                        <div className="flex flex-wrap gap-2">
                          {movie.genre_ids && movie.genre_ids.length > 0
                            ? convertGenre(movie.genre_ids).map(
                                (genre, idx) => (
                                  <span
                                    key={idx}
                                    className="text-white/80 text-sm flex items-center"
                                  >
                                    {idx > 0 && <span className="mr-2">•</span>}
                                    {genre}
                                  </span>
                                )
                              )
                            : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}

export default Play;
