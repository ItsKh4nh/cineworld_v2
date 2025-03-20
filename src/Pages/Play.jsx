import React, { useEffect, useState, useRef } from "react";
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
  configurationLanguages
} from "../config/URLs";
import { imageURL, imageURL2, languageMap } from "../config/constants";
import Navbar from "../components/Header/Navbar";
import Footer from "../components/Footer/Footer";
import usePlayMovie from "../hooks/usePlayMovie";
import useUpdateMyList from "../hooks/useUpdateMyList";
import { ClipLoader } from "react-spinners";
import Papa from 'papaparse';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaImdb, FaFacebook, FaInstagram, FaTwitter, FaWikipediaW } from "react-icons/fa";
import StarRatings from "../components/StarRatings";

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
  const videoRef = useRef(null);

  // Hooks
  const { addToMyList, removeFromMyList, PopupMessage, checkIfInMyList } = useUpdateMyList();
  const { playMovie } = usePlayMovie();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Check movie source
  const checkMovieSource = async () => {
    try {
      const response = await fetch('/movie_sources/OPhim.csv');
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          const source = results.data.find(row => row.movie_id === id);
          if (source && source.link_embed_1) {
            setMovieSource(source.link_embed_1);
            // If we have a direct source, don't load YouTube trailer
            setUrlId("");
          }
        }
      });
    } catch (error) {
      console.error("Error checking movie source:", error);
    }
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatMoney = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatLanguage = (languageCode) => {
    if (!languageCode) return "N/A";
    
    // First check our languages object from the API
    if (languages[languageCode]) {
      return languages[languageCode];
    }
    
    // Fall back to our predefined map
    if (languageMap[languageCode]) {
      return languageMap[languageCode];
    }
    
    // If no match found, return the code in uppercase
    return languageCode.toUpperCase();
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Scroll to video on play
  const scrollToVideo = () => {
    if (videoRef.current) {
      videoRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Check if movie is in user's list
  const checkMovieInList = async () => {
    const result = await checkIfInMyList(id);
    setIsInMyList(result);
  };

  // Data fetching
  useEffect(() => {
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
      axios.get(configurationLanguages)
        .then(response => {
          // Convert array to object with ISO_639_1 as keys
          const languagesObj = {};
          response.data.forEach(lang => {
            languagesObj[lang.iso_639_1] = lang.english_name;
          });
          setLanguages(languagesObj);
        })
        .catch(error => {
          console.error("Error fetching languages:", error);
        });
    }

    // Fetch trailer videos
    axios.get(movieVideos(id))
      .then((response) => {
        if (response.data.results.length !== 0) {
          // Set the first trailer as the active video for the page header
          const trailers = response.data.results.filter(
            video => video.type === "Trailer" || video.type === "Teaser"
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
      .catch(error => {
        console.error("Error fetching videos:", error);
      });

    // Fetch movie details
    axios.get(getMovieDetails(id))
      .then((response) => {
        setMovieDetails(response.data);
        
        // If movie belongs to a collection, fetch collection details
        if (response.data.belongs_to_collection) {
          axios.get(collectionDetails(response.data.belongs_to_collection.id))
            .then(collectionResponse => {
              setCollectionInfo(collectionResponse.data);
            })
            .catch(error => {
              console.error("Error fetching collection:", error);
            });
        }

        // Fetch external IDs (IMDB, social media, etc.)
        axios.get(movieExternalIds(id))
          .then(externalResponse => {
            setExternalIds(externalResponse.data);
          })
          .catch(error => {
            console.error("Error fetching external IDs:", error);
          });

        // Fetch movie keywords
        axios.get(movieKeywords(id))
          .then(keywordsResponse => {
            setKeywords(keywordsResponse.data.keywords || []);
          })
          .catch(error => {
            console.error("Error fetching keywords:", error);
          });

        // Fetch movie reviews
        axios.get(movieReviews(id))
          .then(reviewsResponse => {
            setReviews(reviewsResponse.data.results || []);
          })
          .catch(error => {
            console.error("Error fetching reviews:", error);
          });

        // Fetch similar movies
        axios.get(movieRecommendations(id))
          .then((res) => {
            setSimilarMovies(res.data.results.slice(0, 12));
            setLoading(false);
          })
          .catch(error => {
            console.error("Error fetching recommendations:", error);
            setLoading(false);
          });
      })
      .catch(error => {
        console.error("Error fetching movie details:", error);
        setLoading(false);
      });
  }, [id]);

  // Add a separate effect to recheck if the movie is in MyList after PopupMessage changes
  // (which happens when a movie is added or removed from the list)
  useEffect(() => {
    if (!loading) {
      checkMovieInList();
    }
  }, [PopupMessage]);

  // Handle movie list actions
  const handleMyListAction = () => {
    console.log("Movie details being passed:", movieDetails);
    console.log("Does movie have genres?", movieDetails.genres);
    
    if (isInMyList) {
      // Instead of removing directly, open the rating modal to update the rating
      addToMyList(movieDetails);
      // The actual update will happen when the user saves from the modal
    } else {
      addToMyList(movieDetails);
      // Don't set isInMyList=true here - it will be updated when checkMovieInList runs after the rating is saved
    }
  };

  // Handle video selection
  const handleVideoSelect = (video) => {
    // Open the video directly in YouTube in a new tab
    window.open(`https://www.youtube.com/watch?v=${video.key}`, '_blank');
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
          >
            {movieSource ? (
              <iframe
                src={movieSource}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            ) : urlId ? (
              <iframe
                width="100%"
                height="100%"
                src={`//www.youtube.com/embed/${urlId}?modestbranding=1&autoplay=1`}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            ) : (
              <div 
                className="w-full h-full bg-cover bg-center flex items-end"
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8)), url(${imageURL + movieDetails.backdrop_path})`,
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
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill={
                      movieDetails.vote_average <= 2 ? "#ff4545" : // Red
                      movieDetails.vote_average <= 4 ? "#ffa534" : // Orange
                      movieDetails.vote_average <= 6 ? "#ffe234" : // Yellow
                      movieDetails.vote_average <= 8 ? "#b7dd29" : // Light green
                      "#57e32c" // Bright green
                    }
                    className="w-7 h-7 mr-2"
                    aria-hidden="true"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  <span className="text-base text-white">
                    <span className="font-bold">{movieDetails.vote_average ? parseFloat(movieDetails.vote_average.toFixed(2)) : 'N/A'}</span>
                    <span>/10 </span>
                    <span className="text-sm text-gray-300">
                      ({movieDetails.vote_count ? movieDetails.vote_count.toLocaleString() : '0'} Votes)
                    </span>
                  </span>
                </div>
              </div>
              
              <div className="h-6 border-l border-gray-500"></div>
              
              <div className="flex items-center">
                <span className="font-medium text-gray-400 mr-2">Released:</span>
                <span className="text-sm md:text-base">
                  {formatDate(movieDetails.release_date)}
                </span>
              </div>
              
              <div className="h-6 border-l border-gray-500"></div>
              
              <div className="flex items-center">
                <span className="font-medium text-gray-400 mr-2">Runtime:</span>
                <span className="text-sm md:text-base">{formatRuntime(movieDetails.runtime)}</span>
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
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 mr-1" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                        />
                      </svg>
                      Update Your Rating
                    </>
                  ) : (
                    <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1" 
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                          strokeWidth={2} 
                          d="M12 4v16m8-8H4" 
                      />
                    </svg>
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
                      activeTab === 'overview'
                        ? 'text-yellow-500 border-b-2 border-yellow-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                  <button
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'videos'
                        ? 'text-yellow-500 border-b-2 border-yellow-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('videos')}
                  >
                    Videos
                  </button>
                  <button
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'cast'
                        ? 'text-yellow-500 border-b-2 border-yellow-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('cast')}
                  >
                    Cast & Crew
                  </button>
                  <button
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'reviews'
                        ? 'text-yellow-500 border-b-2 border-yellow-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('reviews')}
                  >
                    Reviews
                  </button>
                  {collectionInfo && (
                    <button
                      className={`px-4 py-2 font-medium ${
                        activeTab === 'collection'
                          ? 'text-yellow-500 border-b-2 border-yellow-500'
                          : 'text-gray-400 hover:text-white'
                      }`}
                      onClick={() => setActiveTab('collection')}
                    >
                      Collection
                    </button>
                  )}
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div>
                      <div className="lg:hidden mb-6 flex justify-center">
                        <img
                          src={`${imageURL2}${movieDetails.poster_path}`}
                          alt={movieDetails.title}
                          className="w-1/2 rounded-lg shadow-lg"
              />
            </div>
                      
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">Storyline</h2>
                        <p className="text-gray-300 leading-relaxed">
                          {movieDetails.overview || "No overview available."}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Basic Details */}
                        <div>
                          <h2 className="text-xl font-semibold mb-4">Details</h2>
                          
                          <div className="space-y-2">
                            <div className="flex">
                              <span className="w-32 text-gray-400">Status:</span>
                              <span>{movieDetails.status}</span>
                            </div>

                            {movieDetails.tagline && (
                              <div className="flex">
                                <span className="w-32 text-gray-400">Tagline:</span>
                                <span>{movieDetails.tagline}</span>
                              </div>
                            )}
                            
                            {movieDetails.original_title && movieDetails.original_title !== movieDetails.title && (
                              <div className="flex">
                                <span className="w-32 text-gray-400">Original Title:</span>
                                <span>{movieDetails.original_title}</span>
                              </div>
                            )}
                            
                            <div className="flex">
                              <span className="w-32 text-gray-400">Original Language:</span>
                              <span>{formatLanguage(movieDetails.original_language)}</span>
                            </div>

                            {movieDetails.homepage && (
                              <div className="flex items-center">
                                <span className="w-32 text-gray-400">Homepage:</span>
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

                            <div className="flex">
                              <span className="w-32 text-gray-400">Budget:</span>
                              <span>{formatMoney(movieDetails.budget)}</span>
                            </div>
                            
                            <div className="flex">
                              <span className="w-32 text-gray-400">Revenue:</span>
                              <span>{formatMoney(movieDetails.revenue)}</span>
                            </div>

                            {movieDetails.production_countries?.length > 0 && (
                              <div className="flex">
                                <span className="w-32 text-gray-400">Origin:</span>
                                <span>
                                  {movieDetails.production_countries.map(country => country.name).join(', ')}
                                </span>
                              </div>
                            )}

                            {movieDetails.spoken_languages?.length > 0 && (
                              <div className="flex">
                                <span className="w-32 text-gray-400">Spoken Languages:</span>
                                <span>
                                  {movieDetails.spoken_languages.map(lang => formatLanguage(lang.iso_639_1)).join(', ')}
                                </span>
                              </div>
                            )}

                            {/* Social Media Links Section */}
                            {(externalIds.imdb_id || externalIds.facebook_id || externalIds.instagram_id || externalIds.twitter_id || externalIds.wikidata_id) && (
                              <div className="mt-4 mb-2">
                                <h3 className="text-lg font-semibold text-white mb-2">Follow on Social Media</h3>
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
                            {movieDetails.genres?.map(genre => (
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
                              <h2 className="text-xl font-semibold mb-4">Keywords</h2>
                              <div className="flex flex-wrap gap-2 mb-6">
                                {keywords.map(keyword => (
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
                              <h2 className="text-xl font-semibold mb-4">Production</h2>
                              <div className="flex flex-wrap gap-4">
                                {movieDetails.production_companies.map(company => (
                                  <div key={company.id} className="flex flex-col items-center text-center max-w-[150px]">
                                    {company.logo_path ? (
                                      <img 
                                        src={`${imageURL2}${company.logo_path}`}
                                        alt={company.name}
                                        className="h-12 mb-2 bg-white p-1 rounded"
                                      />
                                    ) : (
                                      <div className="h-12 mb-2 flex items-center justify-center">
                                        <span className="text-sm text-gray-400">[No Logo]</span>
                                      </div>
                                    )}
                                    <span className="text-sm text-center">{company.name}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Videos Tab */}
                  {activeTab === 'videos' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Videos & Trailers</h2>
                      
                      {trailerVideos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {trailerVideos.map(video => (
                            <div 
                              key={video.id} 
                              className={`cursor-pointer group relative ${
                                activeVideo?.id === video.id 
                                  ? 'ring-2 ring-yellow-500' 
                                  : ''
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
                                  <svg 
                                    className="w-12 h-12 text-red-600" 
                                    fill="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                  <span className="text-white text-sm mt-2">Open in YouTube</span>
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="font-medium text-sm truncate">{video.name}</p>
                                <p className="text-xs text-gray-400">{video.type}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">No videos available for this movie.</p>
                      )}
                    </div>
                  )}

                  {/* Cast & Crew Tab */}
                  {activeTab === 'cast' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Cast</h2>
                      
                      {movieDetails.credits?.cast?.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                          {movieDetails.credits.cast.slice(0, 10).map(person => (
                            <div 
                              key={person.id} 
                              className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => navigate(`/people/${person.id}`)}
                            >
                              <div className="aspect-square rounded-full overflow-hidden mb-2 mx-auto w-20 h-20">
                                {person.profile_path ? (
                                  <img 
                                    src={`${imageURL2}${person.profile_path}`}
                                    alt={person.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                    <span className="text-2xl">👤</span>
                                  </div>
                                )}
                              </div>
                              <p className="font-medium text-sm">{person.name}</p>
                              <p className="text-xs text-gray-400 truncate">{person.character}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 mb-8">No cast information available.</p>
                      )}
                      
                      <h2 className="text-xl font-semibold mb-4">Crew</h2>
                      
                      {movieDetails.credits?.crew?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {/* Group the crew by their primary roles */}
                          {[
                            {title: 'Directors', jobs: ['Director']},
                            {title: 'Writers', jobs: ['Screenplay', 'Writer', 'Story', 'Script']},
                            {title: 'Producers', jobs: ['Producer', 'Executive Producer']}
                          ].map(roleGroup => {
                            // Filter crew by the specified job roles
                            const crewInRole = movieDetails.credits.crew
                              .filter(person => roleGroup.jobs.includes(person.job));
                            
                            // Only display non-empty role groups
                            return crewInRole.length > 0 ? (
                              <div key={roleGroup.title} className="mb-4">
                                <h3 className="text-lg font-medium text-yellow-500 mb-2">{roleGroup.title}</h3>
                                {crewInRole.map(person => (
                                  <div 
                                    key={`${person.id}-${person.job}`} 
                                    className="flex items-center mb-2 cursor-pointer hover:bg-gray-800 rounded p-1 transition-colors"
                                    onClick={() => navigate(`/people/${person.id}`)}
                                  >
                                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                                      {person.profile_path ? (
                                        <img 
                                          src={`${imageURL2}${person.profile_path}`}
                                          alt={person.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                          <span className="text-sm">👤</span>
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">{person.name}</p>
                                      <p className="text-xs text-gray-400">{person.job}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-400">No crew information available.</p>
                      )}
                    </div>
                  )}

                  {/* Reviews Tab */}
                  {activeTab === 'reviews' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6">Critics Reviews</h2>
                      
                      {reviews?.length > 0 ? (
                        <div className="space-y-6">
                          {reviews.map(review => (
                            <div key={review.id} className="bg-gray-800 rounded-lg p-4">
                              <div className="flex items-center mb-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                                  {review.author_details?.avatar_path ? (
                                    <img 
                                      src={review.author_details.avatar_path.startsWith('/') && !review.author_details.avatar_path.startsWith('/https:') 
                                          ? `${imageURL2}${review.author_details.avatar_path}` 
                                          : review.author_details.avatar_path.replace(/^\//, '')}
                                      alt={review.author}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {e.target.onerror = null; e.target.src = 'https://placehold.co/150x150?text=🧩';}}
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                      <span className="text-xl">🧩</span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold">{review.author}</p>
                                  <div className="flex items-center">
                                    {review.author_details?.rating && (
                                      <div className="mr-3 flex items-center">
                                        <span className="text-yellow-500 mr-1">★</span>
                                        <span>{review.author_details.rating}/10</span>
                                      </div>
                                    )}
                                    <span className="text-sm text-gray-400">
                                      {formatDate(review.updated_at || review.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="review-content">
                                <p className="text-gray-300 leading-relaxed line-clamp-4">{review.content}</p>
                                {review.content.length > 300 && (
                                  <button 
                                    className="text-blue-400 hover:underline mt-2"
                                    onClick={(e) => {
                                      const content = e.target.parentElement;
                                      content.querySelector('p').classList.toggle('line-clamp-4');
                                      e.target.textContent = e.target.textContent === 'Read more' 
                                        ? 'Show less' 
                                        : 'Read more';
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
                        <p className="text-gray-400">No reviews available for this movie.</p>
                      )}
                    </div>
                  )}

                  {/* Collection Tab */}
                  {activeTab === 'collection' && collectionInfo && (
                    <div>
                      <div 
                        className="w-full h-40 bg-cover bg-center rounded-lg mb-6"
                        style={{
                          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8)), url(${imageURL}${collectionInfo.backdrop_path})`,
                        }}
                      >
                        <div className="h-full flex items-center p-6">
                          <h2 className="text-2xl font-bold">{collectionInfo.name}</h2>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-6">{collectionInfo.overview}</p>
                      
                      <h3 className="text-xl font-semibold mb-4">Movies in this collection</h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {collectionInfo.parts.map(movie => (
                          <div 
                            key={movie.id} 
                            className={`cursor-pointer group relative ${
                              movie.id === parseInt(id) ? 'ring-2 ring-yellow-500' : ''
                            }`}
                            onClick={() => navigate(`/play/${movie.id}`)}
                          >
                            <div className="relative aspect-[2/3]">
                              <img 
                                src={movie.poster_path ? `${imageURL2}${movie.poster_path}` : 'https://via.placeholder.com/150x225?text=No+Poster'} 
                                alt={movie.title} 
                                className="w-full h-full object-cover rounded"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="text-white">
                                  {movie.id === parseInt(id) ? 'Currently Viewing' : 'View'}
                                </div>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="font-medium text-sm">{movie.title}</p>
                              <p className="text-xs text-gray-400">
                                {movie.release_date ? formatDate(movie.release_date).split(',')[1] : 'TBA'}
                              </p>
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
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {similarMovies.map(movie => (
                    <div 
                      key={movie.id} 
                      className="cursor-pointer group"
                      onClick={() => {
                        playMovie(movie);
                        window.location.reload();
                      }}
                    >
                      <div className="relative aspect-[2/3] mb-2">
                        <img 
                          src={movie.poster_path ? `${imageURL2}${movie.poster_path}` : 'https://via.placeholder.com/150x225?text=No+Poster'} 
                          alt={movie.title} 
                          className="w-full h-full object-cover rounded transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-12 w-12" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                            />
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                            />
                          </svg>
                        </div>
                      </div>
                      <h3 className="font-medium text-sm truncate">{movie.title}</h3>
                      <div className="flex items-center mt-1">
                        <svg 
                          className="w-4 h-4 text-yellow-500" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs text-gray-400 ml-1">
                          {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                        </span>
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
