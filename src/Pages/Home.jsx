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
  getGenreList
} from "../config/URLs";
import { discoverByPeople } from "../config/URLs";
import axios from "../axios";

function Home() {
  const { User } = useContext(AuthContext);
  const [userGenres, setUserGenres] = useState([]);
  const [favoritePeopleMovies, setFavoritePeopleMovies] = useState([]);
  const [favoritePeople, setFavoritePeople] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get current date in YYYY-MM-DD format for API filtering
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch user preferences when component mounts
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!User) return;

      try {
        // Fetch genre preferences
        const preferencesDoc = await getDoc(doc(db, "UserPreferences", User.uid));
        if (preferencesDoc.exists()) {
          const data = preferencesDoc.data();
          if (data.genres && data.genres.length > 0) {
            setUserGenres(data.genres);
          }
        }

        // Fetch favorite people
        const myListDoc = await getDoc(doc(db, "MyList", User.uid));
        if (myListDoc.exists() && myListDoc.data().people && myListDoc.data().people.length > 0) {
          const people = myListDoc.data().people;
          setFavoritePeople(people);
          
          if (people.length > 0) {
            // Create a pipe-separated list of people IDs for OR logic
            const peopleIds = people.map(person => person.id).join('|');
            
            // Fetch movies with any of the favorite people using OR logic
            const response = await axios.get(discoverByPeople(peopleIds));
            
            if (response.data && response.data.results) {
              setFavoritePeopleMovies(response.data.results);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPreferences();
  }, [User]);

  return (
    <div>
      <Banner url={Trending}></Banner>
      <div className="w-[99%] ml-1">
        <RowPost first title="Trending" islarge url={Trending} key={Trending}></RowPost>
        <RowPost
          title="Now Playing"
          url={NowPlaying}
          key={NowPlaying}
        ></RowPost>
        
        {/* Display genre-specific rows based on user preferences */}
        {userGenres.map((genre) => (
          <RowPost
            key={`genre-${genre.id}`}
            title={genre.name}
            url={getGenreList(genre.id) + '&sort_by=vote_average.desc&vote_count.gte=100'}
          ></RowPost>
        ))}
        
        {/* Display movies with favorite cast members */}
        {favoritePeopleMovies.length > 0 && (
          <RowPost
            title="Looking for your favorite cast?"
            movieData={favoritePeopleMovies}
            key="favorite-cast"
          ></RowPost>
        )}
        
        <RowPost
          title="Top Rated of All Time"
          url={`${TopRated}`}
          key={TopRated}
        ></RowPost>
      </div>
      <Footer></Footer>
    </div>
  );
}

export default Home;
