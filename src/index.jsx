import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter as Router } from "react-router-dom";

import Context from "./contexts/UserContext";
import MoviePopUpProvider from "./contexts/MoviePopUpContext";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <Context>
      <MoviePopUpProvider>
        <App />
      </MoviePopUpProvider>
    </Context>
  </Router>
);
