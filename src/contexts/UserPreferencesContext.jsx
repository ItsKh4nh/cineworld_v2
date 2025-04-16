import React, { createContext, useState, useContext, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import { AuthContext } from "./UserContext";
import UserPreferencesModal from "../components/Modals/UserPreferencesModal";

/**
 * Context for managing user preferences across the application
 * Handles the preferences modal display and user preference state
 */
export const UserPreferencesContext = createContext();

export const UserPreferencesProvider = ({ children }) => {
  const { User } = useContext(AuthContext);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  /**
   * Check if the user has set preferences when they log in
   * Shows the preferences modal automatically for new users
   */
  useEffect(() => {
    const checkUserPreferences = async () => {
      if (!User) return;

      try {
        // Check if user has preferences in MyList collection
        const myListDoc = await getDoc(doc(db, "MyList", User.uid));

        // Show the modal for first-time users or those without preferences
        if (!myListDoc.exists() || !myListDoc.data().preferredGenres) {
          setIsNewUser(true);
          setShowPreferencesModal(true);
        } else {
          setIsNewUser(false);
        }
      } catch (error) {
        console.error("Error checking user preferences:", error);
      }
    };

    checkUserPreferences();
  }, [User]);

  /**
   * Closes the preferences modal
   */
  const closePreferencesModal = () => {
    setShowPreferencesModal(false);
  };

  /**
   * Opens the preferences modal for existing users
   */
  const openPreferencesModal = () => {
    setShowPreferencesModal(true);
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        isNewUser,
        openPreferencesModal,
        closePreferencesModal,
      }}
    >
      {children}
      {showPreferencesModal && User && (
        <UserPreferencesModal user={User} onClose={closePreferencesModal} />
      )}
    </UserPreferencesContext.Provider>
  );
};
