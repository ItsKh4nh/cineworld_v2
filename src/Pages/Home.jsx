import React, { useContext, useEffect, useState } from "react";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import { AuthContext } from "../contexts/UserContext";

import Banner from "../components/Banner/Banner";
import Footer from "../components/Footer/Footer";
import RowPost from "../components/RowPost/RowPost";

import {
  Adventure,
  Animated,
  comedy,
  horror,
  originals,
  SciFi,
  trending,
  trendingSeries,
  UpcomingMovies,
  War,
} from "../config/URLs";

function Home() {
  const { User } = useContext(AuthContext);

  return (
    <div>
      <Banner url={trending}></Banner>
      <div className="w-[99%] ml-1">
        <RowPost first title="Trending" url={trending} key={trending}></RowPost>
        <RowPost title="Animated" url={Animated} key={Animated}></RowPost>
        <RowPost
          title="Cineworld Originals"
          islarge
          url={originals}
          key={originals}
        ></RowPost>
        <RowPost
          title="Trending Series"
          url={trendingSeries}
          key={trendingSeries}
        ></RowPost>
        <RowPost title="Science Fiction" url={SciFi}></RowPost>
        <RowPost title="Upcoming Movies" url={UpcomingMovies}></RowPost>
        <RowPost title="Comedy" url={comedy}></RowPost>
        <RowPost title="Adventure" url={Adventure}></RowPost>
        <RowPost title="Horror" url={horror}></RowPost>
        <RowPost title="War" url={War}></RowPost>
      </div>
      <Footer></Footer>
    </div>
  );
}

export default Home;
