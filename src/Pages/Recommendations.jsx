import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/UserContext";
import { RatingModalContext } from "../contexts/RatingModalContext";
import useGenresConverter from "../hooks/useGenresConverter";
import useMoviePopup from "../hooks/useMoviePopup";
import useUpdateMyList from "../hooks/useUpdateMyList";
import Footer from "../components/Footer/Footer";
import MovieCard from "../components/Cards/MovieCard";
import { getPersonalizedRecommendations } from "../services/RecommendationsService";

function Recommendations() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const { User } = useContext(AuthContext);
  const { handleMoviePopup, myListMovies } = useMoviePopup();
  const { convertGenre } = useGenresConverter();
  const { addToMyList, removeFromMyList } = useUpdateMyList();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noMoviesMessage, setNoMoviesMessage] = useState("");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!User) {
        navigate("/signin");
        return;
      }

      try {
        setLoading(true);
        const recommendations = await getPersonalizedRecommendations(User.uid);

        // Add isInMyList property to each movie
        const moviesWithMyListStatus = recommendations.map(movie => ({
          ...movie,
          isInMyList: myListMovies.some(m => m.id === movie.id)
        }));

        setMovies(moviesWithMyListStatus);

        if (recommendations.length === 0) {
          setNoMoviesMessage("INTERNAL SERVER ERROR");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setLoading(false);
        setNoMoviesMessage("An error occurred while fetching recommendations. Please try again later.");
      }
    };

    fetchRecommendations();
  }, [User, myListMovies]);

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-24 pb-8 px-8">
        <h1 className="text-white text-4xl font-bold">You might want to give these a try</h1>
      </div>

      {/* Movies grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-4 md:px-8 pb-12">
        {loading ? (
          <div className="col-span-full flex justify-center items-center h-64">
            <p className="text-white text-lg">Loading recommendations...</p>
          </div>
        ) : movies.length > 0 ? (
          movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              handleMoviePopup={handleMoviePopup}
              addToMyList={addToMyList}
              removeFromMyList={removeFromMyList}
              convertGenre={convertGenre}
            />
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center h-64 px-6">
            <p className="text-white text-lg text-center">{noMoviesMessage}</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Recommendations; 