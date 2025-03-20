import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../axios";
import { 
  personDetails, 
  personMovieCredits, 
  personExternalIds,
  personTaggedImages
} from "../config/URLs";
import { imageURL, imageURL2 } from "../config/constants";
import Navbar from "../components/Header/Navbar";
import Footer from "../components/Footer/Footer";
import { ClipLoader } from "react-spinners";
import { FaImdb, FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import ColoredStarRating from "../components/StarRating/ColoredStarRating";

function People() {
  // State variables
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState({});
  const [movieCredits, setMovieCredits] = useState({});
  const [externalIds, setExternalIds] = useState({});
  const [taggedImages, setTaggedImages] = useState([]);
  const [activeTab, setActiveTab] = useState("about");

  // Hooks
  const { id } = useParams();
  const navigate = useNavigate();

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (birthday, deathday) => {
    if (!birthday) return "N/A";
    
    const birthDate = new Date(birthday);
    let endDate = deathday ? new Date(deathday) : new Date();
    
    let age = endDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = endDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Data fetching
  useEffect(() => {
    // Reset states
    setPerson({});
    setMovieCredits({});
    setExternalIds({});
    setTaggedImages([]);
    setLoading(true);

    // Fetch person details
    axios.get(personDetails(id))
      .then((response) => {
        setPerson(response.data);
      })
      .catch(error => {
        console.error("Error fetching person details:", error);
      });

    // Fetch movie credits
    axios.get(personMovieCredits(id))
      .then((response) => {
        setMovieCredits(response.data);
      })
      .catch(error => {
        console.error("Error fetching movie credits:", error);
      });

    // Fetch external IDs
    axios.get(personExternalIds(id))
      .then((response) => {
        setExternalIds(response.data);
      })
      .catch(error => {
        console.error("Error fetching external IDs:", error);
      });

    setLoading(false);
  }, [id]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <ClipLoader color="#E50914" size={60} />
          <p className="mt-4 text-xl">Loading person details...</p>
        </div>
      ) : (
        <>
          {/* Hero Section with Background */}
          <div 
            className="relative w-full h-[40vh] md:h-[50vh] bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(${imageURL}${person.profile_path})`,
              backgroundPosition: 'center 20%',
            }}
          >
            <div className="container mx-auto px-4 h-full flex items-end">
              <div className="pb-8">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                  {person.name}
                </h1>
                {person.known_for_department && (
                  <p className="text-xl text-gray-300">
                    {person.known_for_department}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column - Profile Image and Details */}
              <div>
                <div className="mb-6">
                  <img
                    src={`${imageURL2}${person.profile_path}`}
                    alt={person.name}
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>

                <div className="bg-gray-900 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold mb-4">Personal Info</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-gray-400 font-medium">Gender</h3>
                      <p>{person.gender === 1 ? "Female" : person.gender === 2 ? "Male" : "Not specified"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-400 font-medium">Birthday</h3>
                      <p>{person.birthday ? formatDate(person.birthday) : "N/A"}</p>
                      {person.birthday && !person.deathday && (
                        <p className="text-sm text-gray-400">
                          ({calculateAge(person.birthday)} years old)
                        </p>
                      )}
                    </div>
                    
                    {person.deathday && (
                      <div>
                        <h3 className="text-gray-400 font-medium">Died</h3>
                        <p>{formatDate(person.deathday)}</p>
                        <p className="text-sm text-gray-400">
                          ({calculateAge(person.birthday, person.deathday)} years old)
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-gray-400 font-medium">Place of Birth</h3>
                      <p>{person.place_of_birth || "N/A"}</p>
                    </div>
                    
                    {/* External IDs */}
                    {(externalIds.imdb_id || externalIds.facebook_id || externalIds.instagram_id || externalIds.twitter_id) && (
                      <div>
                        <h3 className="text-gray-400 font-medium">Social Media</h3>
                        <div className="flex space-x-4 mt-2">
                          {externalIds.imdb_id && (
                            <a 
                              href={`https://imdb.com/name/${externalIds.imdb_id}`}
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
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Tabs */}
              <div className="md:col-span-2">
                {/* Tabs Navigation */}
                <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
                  <button
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'about'
                        ? 'text-yellow-500 border-b-2 border-yellow-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('about')}
                  >
                    About
                  </button>
                  <button
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'movies'
                        ? 'text-yellow-500 border-b-2 border-yellow-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('movies')}
                  >
                    Movies
                  </button>
                  <button
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'photos'
                        ? 'text-yellow-500 border-b-2 border-yellow-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('photos')}
                  >
                    Photos
                  </button>
                </div>
                
                {/* Tab Content */}
                <div>
                  {/* About Tab */}
                  {activeTab === 'about' && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-4">Biography</h2>
                      {person.biography ? (
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                          {person.biography}
                        </p>
                      ) : (
                        <p className="text-gray-400">
                          We don't have a biography for {person.name}.
                        </p>
                      )}
                      
                      {/* Featured Movies Section */}
                      {(movieCredits.cast?.length > 0 || movieCredits.crew?.length > 0) && (
                        <div className="mt-8">
                          <h2 className="text-2xl font-semibold mb-4">Featured Movies</h2>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[...(movieCredits.cast || []), ...(movieCredits.crew || [])]
                              .filter(movie => movie.poster_path && movie.vote_count > 0)
                              // Remove duplicates (same movie might appear in both cast and crew)
                              .filter((movie, index, self) => 
                                index === self.findIndex(m => m.id === movie.id)
                              )
                              .sort((a, b) => b.vote_count - a.vote_count)
                              .slice(0, 8)
                              .map(movie => (
                                <div
                                  key={movie.id}
                                  className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                                  onClick={() => navigate(`/play/${movie.id}`)}
                                >
                                  {/* Movie poster */}
                                  <div className="relative">
                                    <img
                                      src={`${imageURL2}${movie.poster_path}`}
                                      alt={movie.title}
                                      className="w-full aspect-[2/3] object-cover"
                                    />
                                    {/* Rating badge */}
                                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full p-1">
                                      <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        viewBox="0 0 24 24" 
                                        fill={
                                          movie.vote_average <= 2 ? "#ff4545" : // Red
                                          movie.vote_average <= 4 ? "#ffa534" : // Orange
                                          movie.vote_average <= 6 ? "#ffe234" : // Yellow
                                          movie.vote_average <= 8 ? "#b7dd29" : // Light green
                                          "#57e32c" // Bright green
                                        }
                                        className="w-5 h-5"
                                        aria-hidden="true"
                                      >
                                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  </div>
                                  
                                  {/* Movie details */}
                                  <div className="p-3">
                                    {/* Movie title */}
                                    <h3 className="text-white text-lg font-bold mb-1 line-clamp-2">{movie.title}</h3>
                                    
                                    {/* Release date */}
                                    <p className="text-white/80 text-sm mb-2">
                                      {movie.release_date 
                                        ? new Date(movie.release_date).toLocaleDateString('en-US', {
                                            year: 'numeric'
                                          }) 
                                        : 'Release date unknown'}
                                    </p>
                                    
                                    {/* Character or Job */}
                                    {movie.character ? (
                                      <p className="text-gray-400 text-sm italic">
                                        as {movie.character}
                                      </p>
                                    ) : movie.job ? (
                                      <p className="text-gray-400 text-sm italic">
                                        {movie.job}
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Movies Tab */}
                  {activeTab === 'movies' && (
                    <div>
                      {/* Acting Credits */}
                      {movieCredits.cast && movieCredits.cast.length > 0 && (
                        <div className="mb-8">
                          <h2 className="text-2xl font-semibold mb-4">Acting Credits</h2>
                          <div className="space-y-4">
                            {movieCredits.cast
                              .sort((a, b) => {
                                const dateA = a.release_date || "0000-00-00";
                                const dateB = b.release_date || "0000-00-00";
                                return dateB.localeCompare(dateA);
                              })
                              .map(movie => (
                                <div 
                                  key={`${movie.id}-${movie.character}`} 
                                  className="flex items-center bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors cursor-pointer"
                                  onClick={() => navigate(`/play/${movie.id}`)}
                                >
                                  <div className="w-16 md:w-24 flex-shrink-0">
                                    {movie.poster_path ? (
                                      <img 
                                        src={`${imageURL2}${movie.poster_path}`}
                                        alt={movie.title}
                                        className="w-full"
                                      />
                                    ) : (
                                      <div className="bg-gray-800 w-full h-full flex items-center justify-center text-gray-500">
                                        No Image
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-4 flex-grow">
                                    <h3 className="font-medium">{movie.title}</h3>
                                    <p className="text-sm text-gray-400">
                                      {movie.character ? `as ${movie.character}` : ""}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {movie.release_date ? new Date(movie.release_date).getFullYear() : "TBA"}
                                    </p>
                                  </div>
                                  <div className="p-4 flex-shrink-0 hidden md:flex items-center">
                                    <ColoredStarRating rating={movie.vote_average} size="large" />
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Crew Credits */}
                      {movieCredits.crew && movieCredits.crew.length > 0 && (
                        <div>
                          <h2 className="text-2xl font-semibold mb-4">Production Credits</h2>
                          
                          {/* Group by department */}
                          {Array.from(new Set(movieCredits.crew.map(item => item.department)))
                            .sort()
                            .map(department => (
                              <div key={department} className="mb-6">
                                <h3 className="text-xl font-medium text-yellow-500 mb-3">{department}</h3>
                                <div className="space-y-4">
                                  {movieCredits.crew
                                    .filter(item => item.department === department)
                                    .sort((a, b) => {
                                      const dateA = a.release_date || "0000-00-00";
                                      const dateB = b.release_date || "0000-00-00";
                                      return dateB.localeCompare(dateA);
                                    })
                                    .map(movie => (
                                      <div 
                                        key={`${movie.id}-${movie.job}`} 
                                        className="flex items-center bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/play/${movie.id}`)}
                                      >
                                        <div className="w-16 md:w-24 flex-shrink-0">
                                          {movie.poster_path ? (
                                            <img 
                                              src={`${imageURL2}${movie.poster_path}`}
                                              alt={movie.title}
                                              className="w-full"
                                            />
                                          ) : (
                                            <div className="bg-gray-800 w-full h-full flex items-center justify-center text-gray-500">
                                              No Image
                                            </div>
                                          )}
                                        </div>
                                        <div className="p-4 flex-grow">
                                          <h3 className="font-medium">{movie.title}</h3>
                                          <p className="text-sm text-gray-400">
                                            {movie.job || ""}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {movie.release_date ? new Date(movie.release_date).getFullYear() : "TBA"}
                                          </p>
                                        </div>
                                        <div className="p-4 flex-shrink-0 hidden md:flex items-center">
                                          <ColoredStarRating rating={movie.vote_average} size="large" />
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Photos Tab */}
                  {activeTab === 'photos' && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-4">Photos</h2>
                      
                      {/* Profile Images */}
                      {person.images && person.images.profiles && person.images.profiles.length > 0 ? (
                        <div className="mb-8">
                          <h3 className="text-xl font-medium mb-4">Profile Images</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {person.images.profiles.map((image, index) => (
                              <div key={index} className="aspect-[2/3] rounded-lg overflow-hidden">
                                <img 
                                  src={`${imageURL2}${image.file_path}`}
                                  alt={`${person.name} profile ${index+1}`}
                                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-400">
                          No photos available for {person.name}.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      <Footer />
    </div>
  );
}

export default People; 