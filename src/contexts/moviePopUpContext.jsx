import { createContext, useState } from "react";

export const PopUpContext = createContext(null);

export default function Context2({ children }) {
  const [showModal, setShowModal] = useState(false);
  const [movieInfo, setMovieInfo] = useState({});
  const [trailerUrl, setTrailerUrl] = useState("");

  return (
    <PopUpContext.Provider 
      value={{ 
        showModal, 
        setShowModal, 
        movieInfo, 
        setMovieInfo,
        trailerUrl,
        setTrailerUrl
      }}
    >
      {children}
    </PopUpContext.Provider>
  );
}
