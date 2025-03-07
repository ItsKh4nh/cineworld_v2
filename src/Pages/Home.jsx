import React, { useContext, useEffect, useState } from "react";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import { AuthContext } from "../contexts/UserContext";

import Banner from "../components/Banner/Banner";
import Footer from "../components/Footer/Footer";
import RowPost from "../components/RowPost/RowPost";

import {
  Trending,
  Popular,
  TopRated,
  NowPlaying,
} from "../config/URLs";

function Home() {
  const { User } = useContext(AuthContext);

  return (
    <div>
      <Banner url={Trending}></Banner>
      <div className="w-[99%] ml-1">
        <RowPost first title="Trending" islarge url={Trending} key={Trending}></RowPost>
        <RowPost title="Popular" url={Popular} key={Popular}></RowPost>
        <RowPost
          title="Top Rated of All Time"
          url={TopRated}
          key={TopRated}
        ></RowPost>
        <RowPost
          title="Now Playing"
          url={NowPlaying}
          key={NowPlaying}
        ></RowPost>
      </div>
      <Footer></Footer>
    </div>
  );
}

export default Home;
