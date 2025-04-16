import React, { useContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import { AuthContext } from "../contexts/UserContext";
import Banner from "../components/Banner/Banner";
import Footer from "../components/Footer/Footer";
import RowPost from "../components/RowPost/RowPost";
import {
  Trending,
  TopRated,
  NowPlaying,
  getGenreList,
  discoverByPeople,
} from "../config/URLs";
import axios from "../axios";

function Home() {
  const { User } = useContext(AuthContext);

  // State for personalized content
  const [userGenres, setUserGenres] = useState([]);
  const [favoritePeople, setFavoritePeople] = useState([]);
  const [favoritePeopleMovies, setFavoritePeopleMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user preferences and personalized content on component mount or when User changes
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (User) {
        try {
          const myListDoc = await getDoc(doc(db, "MyList", User.uid));

          if (myListDoc.exists()) {
            const data = myListDoc.data();

            // Extract preferred genres if available
            setUserGenres(
              data.preferredGenres?.length > 0 ? data.preferredGenres : []
            );

            // Handle favorite people and their movies
            if (data.people?.length > 0) {
              setFavoritePeople(data.people);

              // Fetch movies featuring user's favorite cast members
              const peopleIds = data.people
                .map((person) => person.id)
                .join("|");
              const response = await axios.get(discoverByPeople(peopleIds));

              setFavoritePeopleMovies(
                response.data.results?.length > 0 ? response.data.results : []
              );
            } else {
              setFavoritePeople([]);
              setFavoritePeopleMovies([]);
            }
          } else {
            // Reset states when no user data exists
            resetPersonalizedContent();
          }
        } catch (error) {
          console.error("Error fetching user preferences:", error);
          resetPersonalizedContent();
        }
      } else {
        // Reset states for guest users
        resetPersonalizedContent();
      }

      setLoading(false);
    };

    // Helper function to reset all personalized content states
    const resetPersonalizedContent = () => {
      setUserGenres([]);
      setFavoritePeople([]);
      setFavoritePeopleMovies([]);
    };

    fetchUserPreferences();
  }, [User]);

  return (
    <div>
      <Banner url={Trending}></Banner>

      <div className="w-[99%] ml-1">
        <RowPost
          first
          title="Trending"
          islarge
          url={Trending}
          key={Trending}
        ></RowPost>
        <RowPost
          title="Now Playing"
          url={NowPlaying}
          key={NowPlaying}
        ></RowPost>

        {/* Personalized genre recommendations based on user preferences */}
        {User &&
          userGenres.map((genre) => (
            <RowPost
              key={`genre-${genre.id}`}
              title={genre.name}
              url={
                getGenreList(genre.id) +
                "&sort_by=vote_average.desc&vote_count.gte=100"
              }
            ></RowPost>
          ))}

        {/* Movies featuring user's favorite actors/directors */}
        {User && favoritePeopleMovies.length > 0 && (
          <RowPost
            title="Looking for your favorite cast?"
            movieData={favoritePeopleMovies}
            key="favorite-cast"
          ></RowPost>
        )}

        <RowPost
          title="Top Rated of All Time"
          url={TopRated}
          key={TopRated}
        ></RowPost>
      </div>
      <Footer></Footer>
    </div>
  );
}

export default Home;
