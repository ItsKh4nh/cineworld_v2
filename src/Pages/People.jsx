import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../axios";
import {
  personDetails,
  personMovieCredits,
  personExternalIds,
} from "../config";
import { imageUrlOriginal, imageUrlBackup } from "../config";
import Footer from "../components/Footer/Footer";
import { ClipLoader } from "react-spinners";
import {
  FaImdb,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import StarRating from "../components/StarRating/StarRating";
import useMoviePopup from "../hooks/useMoviePopup";
import usePeopleList from "../hooks/usePeopleList";
import ConfirmationModal from "../components/Modals/ConfirmationModal";
import { formatDate, calculateAge, handleListAction } from "../utils";

function People() {
  // State variables
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState({});
  const [movieCredits, setMovieCredits] = useState({});
  const [externalIds, setExternalIds] = useState({});
  const [taggedImages, setTaggedImages] = useState([]);
  const [activeTab, setActiveTab] = useState("about");
  const [isInList, setIsInList] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");

  // Hooks
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleMoviePopup } = useMoviePopup();
  const { isPersonInList, addPersonToList, removePersonFromList } =
    usePeopleList();

  // Check if person is in list
  const checkPersonInList = async () => {
    if (id && isPersonInList) {
      const result = await isPersonInList(id);
      setIsInList(result);
    }
  };

  // Handle add to list button click
  const handleAddToListClick = () => {
    setConfirmAction("add");
    setShowConfirmModal(true);
  };

  // Handle remove from list button click
  const handleRemoveFromListClick = () => {
    setConfirmAction("remove");
    setShowConfirmModal(true);
  };

  // Add person to list
  const confirmAddToList = async () => {
    setShowConfirmModal(false);

    // Create a unique toast ID to prevent duplicates
    const toastId = `add-person-${person.id}`;

    await handleListAction(
      addPersonToList,
      person,
      "add",
      () => setIsInList(true),
      toastId
    );
  };

  // Remove person from list
  const confirmRemoveFromList = async () => {
    setShowConfirmModal(false);

    // Create a unique toast ID to prevent duplicates
    const toastId = `remove-person-${person.id}`;

    await handleListAction(
      removePersonFromList,
      person,
      "remove",
      () => setIsInList(false),
      toastId
    );
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
    axios
      .get(personDetails(id))
      .then((response) => {
        setPerson(response.data);
      })
      .catch((error) => {
        console.error("Error fetching person details:", error);
      });

    // Fetch movie credits
    axios
      .get(personMovieCredits(id))
      .then((response) => {
        setMovieCredits(response.data);
      })
      .catch((error) => {
        console.error("Error fetching movie credits:", error);
      });

    // Fetch external IDs
    axios
      .get(personExternalIds(id))
      .then((response) => {
        setExternalIds(response.data);
      })
      .catch((error) => {
        console.error("Error fetching external IDs:", error);
      });

    setLoading(false);

    // Check if person is in list
    checkPersonInList();
  }, [id]);

  return (
    <div className="min-h-screen bg-black text-white">
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
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(${
                person.profile_path
                  ? imageUrlOriginal + person.profile_path
                  : "/placeholder.jpg"
              })`,
              backgroundPosition: "center 20%",
            }}
          >
            <div className="container mx-auto px-4 h-full flex items-end">
              <div className="pb-8 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                    {person.name}
                  </h1>
                </div>

                {person.known_for_department && (
                  <p className="text-xl text-gray-300 mt-2">
                    {person.known_for_department}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Confirmation Modal */}
          <ConfirmationModal
            isOpen={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={
              confirmAction === "add" ? confirmAddToList : confirmRemoveFromList
            }
            title={
              confirmAction === "add" ? "Add to My List" : "Remove from My List"
            }
            message={
              confirmAction === "add"
                ? `Are you sure you want to add ${person.name} to your list?`
                : `Are you sure you want to remove ${person.name} from your list?`
            }
            confirmText={confirmAction === "add" ? "Add" : "Remove"}
            confirmColor={confirmAction === "add" ? "green" : "red"}
          />

          {/* Main Content */}
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column - Profile Image and Details */}
              <div>
                <div className="mb-6">
                  <img
                    src={
                      person.profile_path
                        ? `${imageUrlBackup}${person.profile_path}`
                        : "/placeholder.jpg"
                    }
                    alt={person.name}
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>

                <div className="bg-gray-900 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold mb-4">Personal Info</h2>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-gray-400 font-medium">Gender</h3>
                      <p>
                        {person.gender === 1
                          ? "Female"
                          : person.gender === 2
                          ? "Male"
                          : "Not specified"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-gray-400 font-medium">Birthday</h3>
                      <p>
                        {person.birthday ? formatDate(person.birthday) : "N/A"}
                      </p>
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
                          ({calculateAge(person.birthday, person.deathday)}{" "}
                          years old)
                        </p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-gray-400 font-medium">
                        Place of Birth
                      </h3>
                      <p>{person.place_of_birth || "N/A"}</p>
                    </div>

                    {/* External IDs */}
                    {(externalIds.imdb_id ||
                      externalIds.facebook_id ||
                      externalIds.instagram_id ||
                      externalIds.twitter_id) && (
                      <div>
                        <h3 className="text-gray-400 font-medium">
                          Social Media
                        </h3>
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
                <div className="flex border-b border-gray-700 mb-6 overflow-x-auto justify-between">
                  <div className="flex">
                    <button
                      className={`px-4 py-2 font-medium ${
                        activeTab === "about"
                          ? "text-yellow-500 border-b-2 border-yellow-500"
                          : "text-gray-400 hover:text-white"
                      }`}
                      onClick={() => setActiveTab("about")}
                    >
                      About
                    </button>
                    <button
                      className={`px-4 py-2 font-medium ${
                        activeTab === "movies"
                          ? "text-yellow-500 border-b-2 border-yellow-500"
                          : "text-gray-400 hover:text-white"
                      }`}
                      onClick={() => setActiveTab("movies")}
                    >
                      Movies
                    </button>
                    <button
                      className={`px-4 py-2 font-medium ${
                        activeTab === "photos"
                          ? "text-yellow-500 border-b-2 border-yellow-500"
                          : "text-gray-400 hover:text-white"
                      }`}
                      onClick={() => setActiveTab("photos")}
                    >
                      Photos
                    </button>
                  </div>

                  {/* Add to MyList / Remove from MyList button */}
                  {isInList ? (
                    <button
                      onClick={handleRemoveFromListClick}
                      className="bg-red-600 hover:bg-transparent hover:text-red-600 hover:border-red-600 border border-transparent text-white font-medium px-4 py-1 rounded-md transition duration-300 ease-in-out flex items-center justify-center"
                    >
                      <FaMinus className="mr-2" />
                      Remove from List
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToListClick}
                      className="bg-yellow-500 hover:bg-transparent hover:text-yellow-500 hover:border-yellow-500 border border-transparent text-white font-medium px-4 py-1 rounded-md transition duration-300 ease-in-out flex items-center justify-center"
                    >
                      <FaPlus className="mr-2" />
                      Add to List
                    </button>
                  )}
                </div>

                {/* Tab Content */}
                <div>
                  {/* About Tab */}
                  {activeTab === "about" && (
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
                      {(movieCredits.cast?.length > 0 ||
                        movieCredits.crew?.length > 0) && (
                        <div className="mt-8">
                          <h2 className="text-2xl font-semibold mb-4">
                            Featured Movies
                          </h2>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              ...(movieCredits.cast || []),
                              ...(movieCredits.crew || []),
                            ]
                              .filter(
                                (movie) =>
                                  movie.poster_path && movie.vote_count > 0
                              )
                              // Remove duplicates (same movie might appear in both cast and crew)
                              .filter(
                                (movie, index, self) =>
                                  index ===
                                  self.findIndex((m) => m.id === movie.id)
                              )
                              .sort((a, b) => b.vote_count - a.vote_count)
                              .slice(0, 8)
                              .map((movie) => (
                                <div
                                  key={movie.id}
                                  className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                                  onClick={() => handleMoviePopup(movie)}
                                >
                                  {/* Movie poster */}
                                  <div className="relative">
                                    {movie.poster_path ? (
                                      <img
                                        src={`${imageUrlBackup}${movie.poster_path}`}
                                        alt={movie.title}
                                        className="w-full aspect-[2/3] object-cover"
                                      />
                                    ) : (
                                      <img
                                        src="/placeholderVertical.jpg"
                                        alt={movie.title}
                                        className="w-full aspect-[2/3] object-cover"
                                      />
                                    )}
                                  </div>

                                  {/* Movie details */}
                                  <div className="p-3">
                                    {/* Movie title */}
                                    <h3 className="text-white text-lg font-bold mb-1 line-clamp-2">
                                      {movie.title}
                                    </h3>

                                    {/* Release date */}
                                    <p className="text-white/80 text-sm mb-2">
                                      {movie.release_date
                                        ? new Date(
                                            movie.release_date
                                          ).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                          })
                                        : "Release date unknown"}
                                    </p>

                                    {/* Rating/Score */}
                                    <div className="mb-2">
                                      <StarRating
                                        rating={movie.vote_average}
                                        size="small"
                                        showDenominator={false}
                                      />
                                    </div>

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
                  {activeTab === "movies" && (
                    <div>
                      {/* Acting Credits */}
                      {movieCredits.cast && movieCredits.cast.length > 0 && (
                        <div className="mb-8">
                          <h2 className="text-2xl font-semibold mb-4">
                            Acting Credits
                          </h2>
                          <div className="space-y-4">
                            {movieCredits.cast
                              .sort((a, b) => {
                                const dateA = a.release_date || "0000-00-00";
                                const dateB = b.release_date || "0000-00-00";
                                return dateB.localeCompare(dateA);
                              })
                              .map((movie) => (
                                <div
                                  key={`${movie.id}-${movie.character}`}
                                  className="flex items-center bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors cursor-pointer"
                                  onClick={() => handleMoviePopup(movie)}
                                >
                                  <div className="w-16 md:w-24 flex-shrink-0">
                                    {movie.poster_path ? (
                                      <img
                                        src={`${imageUrlBackup}${movie.poster_path}`}
                                        alt={movie.title}
                                        className="w-full"
                                      />
                                    ) : (
                                      <div className="bg-gray-800 w-full h-full flex items-center justify-center text-gray-500">
                                        <img
                                          src="/placeholderVertical.jpg"
                                          alt={movie.title}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-4 flex-grow">
                                    <h3 className="font-medium">
                                      {movie.title}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                      {movie.character
                                        ? `as ${movie.character}`
                                        : ""}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {movie.release_date
                                        ? new Date(
                                            movie.release_date
                                          ).getFullYear()
                                        : "TBA"}
                                    </p>
                                  </div>
                                  <div className="p-4 flex-shrink-0 hidden md:flex items-center">
                                    <StarRating
                                      rating={movie.vote_average}
                                      size="large"
                                    />
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Crew Credits */}
                      {movieCredits.crew && movieCredits.crew.length > 0 && (
                        <div>
                          <h2 className="text-2xl font-semibold mb-4">
                            Production Credits
                          </h2>

                          {/* Group by department */}
                          {Array.from(
                            new Set(
                              movieCredits.crew.map((item) => item.department)
                            )
                          )
                            .sort()
                            .map((department) => (
                              <div key={department} className="mb-6">
                                <h3 className="text-xl font-medium text-yellow-500 mb-3">
                                  {department}
                                </h3>
                                <div className="space-y-4">
                                  {movieCredits.crew
                                    .filter(
                                      (item) => item.department === department
                                    )
                                    .sort((a, b) => {
                                      const dateA =
                                        a.release_date || "0000-00-00";
                                      const dateB =
                                        b.release_date || "0000-00-00";
                                      return dateB.localeCompare(dateA);
                                    })
                                    .map((movie) => (
                                      <div
                                        key={`${movie.id}-${movie.job}`}
                                        className="flex items-center bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors cursor-pointer"
                                        onClick={() => handleMoviePopup(movie)}
                                      >
                                        <div className="w-16 md:w-24 flex-shrink-0">
                                          {movie.poster_path ? (
                                            <img
                                              src={`${imageUrlBackup}${movie.poster_path}`}
                                              alt={movie.title}
                                              className="w-full"
                                            />
                                          ) : (
                                            <div className="bg-gray-800 w-full h-full flex items-center justify-center text-gray-500">
                                              <img
                                                src="/placeholderVertical.jpg"
                                                alt={movie.title}
                                                className="w-full h-full object-cover"
                                              />
                                            </div>
                                          )}
                                        </div>
                                        <div className="p-4 flex-grow">
                                          <h3 className="font-medium">
                                            {movie.title}
                                          </h3>
                                          <p className="text-sm text-gray-400">
                                            {movie.job || ""}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {movie.release_date
                                              ? new Date(
                                                  movie.release_date
                                                ).getFullYear()
                                              : "TBA"}
                                          </p>
                                        </div>
                                        <div className="p-4 flex-shrink-0 hidden md:flex items-center">
                                          <StarRating
                                            rating={movie.vote_average}
                                            size="large"
                                          />
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
                  {activeTab === "photos" && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-4">Photos</h2>

                      {/* Profile Images */}
                      {person.images &&
                      person.images.profiles &&
                      person.images.profiles.length > 0 ? (
                        <div className="mb-8">
                          <h3 className="text-xl font-medium mb-4">
                            Profile Images
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {person.images.profiles.map((image, index) => (
                              <div
                                key={index}
                                className="aspect-[2/3] rounded-lg overflow-hidden"
                              >
                                {image.file_path ? (
                                  <img
                                    src={`${imageUrlBackup}${image.file_path}`}
                                    alt={`${person.name} profile ${index + 1}`}
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                  />
                                ) : (
                                  <img
                                    src="/placeholder.jpg"
                                    alt={`${person.name} profile ${index + 1}`}
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                  />
                                )}
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
