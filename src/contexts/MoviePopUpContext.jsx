/**
 * Movie Popup Context
 *
 * Provides state management for movie information popups/modals throughout the application.
 * Allows components to show/hide movie detail modals and manage their content
 * without prop drilling.
 */
import { createContext, useState } from "react";

export const PopUpContext = createContext(null);

/**
 * Provider component that makes popup state available to all child components
 * Manages modal visibility, movie information, and trailer URLs
 */
export default function MoviePopUpProvider({ children }) {
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
        setTrailerUrl,
      }}
    >
      {children}
    </PopUpContext.Provider>
  );
}
