import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "../axios";
import { 
  movieVideos, 
  movieDetails as getMovieDetails, 
  movieRecommendations,
  collectionDetails
} from "../config/URLs";
import { imageURL, imageURL2 } from "../config/constants";
import Navbar from "../components/Header/Navbar";
import Footer from "../components/Footer/Footer";
import usePlayMovie from "../hooks/usePlayMovie";
import useUpdateMyList from "../hooks/useUpdateMyList";
import { ClipLoader } from "react-spinners";
import ReactPlayer from 'react-player';
import Papa from 'papaparse';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
          if (source && source.link_m3u8_1) {
            setMovieSource(source.link_m3u8_1);
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
      maximumFractionDigits: 0
    }).format(amount);
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
    setLoading(true);
    
    if (location.state?.From === "MyList") {
      setIsFromMyList(true);
    }

    // Check if movie is in user's list
    checkMovieInList();

    // Check for movie source
    checkMovieSource();

    // Fetch movie videos (for trailer if no direct source)
    axios.get(movieVideos(id))
      .then((response) => {
        if (response.data.results.length !== 0) {
          // Set the first trailer as the active video
          const trailers = response.data.results.filter(
            video => video.type === "Trailer" || video.type === "Teaser"
          );
          if (trailers.length > 0) {
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

  // Handle movie list actions
  const handleMyListAction = () => {
    if (isInMyList) {
      removeFromMyList(movieDetails);
      setIsInMyList(false);
    } else {
      addToMyList(movieDetails);
      setIsInMyList(true);
    }
  };

  // Handle video selection
  const handleVideoSelect = (video) => {
    setActiveVideo(video);
    setUrlId(video.key);
    scrollToVideo();
  };

  return (
    <div className="min-h-screen bg-black text-white">
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
              <ReactPlayer
                url={movieSource}
                width="100%"
                height="100%"
                playing={true}
                controls={true}
                config={{
                  file: {
                    forceHLS: true,
                  }
                }}
              />
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
                <span className="font-bold text-xl bg-yellow-500 text-black py-1 px-3 rounded">
                  {movieDetails.vote_average ? movieDetails.vote_average.toFixed(1) : 'N/A'}
                </span>
                <span className="ml-2 text-sm text-gray-300">
                  {movieDetails.vote_count ? `${movieDetails.vote_count.toLocaleString()} votes` : ''}
                </span>
              </div>
              
              <div className="h-6 border-l border-gray-500"></div>
              
              <div className="flex items-center">
                <span className="text-sm md:text-base">
                  {formatDate(movieDetails.release_date)}
                </span>
              </div>
              
              <div className="h-6 border-l border-gray-500"></div>
              
              <div className="flex items-center">
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
                      ? "bg-gray-700 hover:bg-gray-600" 
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
                          d="M6 18L18 6M6 6l12 12" 
                        />
                      </svg>
                      Remove
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
                      Add to My List
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
                            
                            <div className="flex">
                              <span className="w-32 text-gray-400">Original Language:</span>
                              <span>
                                {movieDetails.original_language?.toUpperCase() || "N/A"}
                              </span>
                            </div>
                            
                            <div className="flex">
                              <span className="w-32 text-gray-400">Budget:</span>
                              <span>{formatMoney(movieDetails.budget)}</span>
                            </div>
                            
                            <div className="flex">
                              <span className="w-32 text-gray-400">Revenue:</span>
                              <span>{formatMoney(movieDetails.revenue)}</span>
                            </div>
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
                          
                          {movieDetails.production_companies?.length > 0 && (
                            <>
                              <h2 className="text-xl font-semibold mb-4">Production</h2>
                              <div className="flex flex-wrap gap-4">
                                {movieDetails.production_companies.map(company => (
                                  <div key={company.id} className="flex items-center">
                                    {company.logo_path ? (
                                      <img 
                                        src={`${imageURL2}${company.logo_path}`}
                                        alt={company.name}
                                        className="h-8 mr-2 bg-white p-1 rounded"
                                      />
                                    ) : (
                                      <span className="text-sm">{company.name}</span>
                                    )}
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
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <svg 
                                    className="w-12 h-12 text-white" 
                                    fill="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
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

                  {/* Cast Tab */}
                  {activeTab === 'cast' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Cast</h2>
                      
                      {movieDetails.credits?.cast?.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                          {movieDetails.credits.cast.slice(0, 10).map(person => (
                            <div key={person.id} className="text-center">
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
                          {movieDetails.credits.crew
                            .filter(person => 
                              ['Director', 'Producer', 'Screenplay', 'Writer'].includes(person.job)
                            )
                            .slice(0, 9)
                            .map(person => (
                              <div key={`${person.id}-${person.job}`} className="flex items-center">
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
                      ) : (
                        <p className="text-gray-400">No crew information available.</p>
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
                                  {movie.id === parseInt(id) ? 'Currently Viewing' : 'View Movie'}
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
