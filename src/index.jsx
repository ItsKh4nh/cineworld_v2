import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { BrowserRouter as Router } from "react-router-dom";
import { FirebaseApp } from "./config/FirebaseConfig";
import Context from "./contexts/UserContext";
import Context2 from "./contexts/moviePopUpContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Context>
        <Context2>
          <App />
        </Context2>
      </Context>
    </Router>
  </React.StrictMode>
);
