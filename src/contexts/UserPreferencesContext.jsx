import React, { createContext, useState, useContext, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import { AuthContext } from "./UserContext";
import UserPreferencesModal from "../components/Modals/UserPreferencesModal";

export const UserPreferencesContext = createContext();

export const UserPreferencesProvider = ({ children }) => {
  const { User } = useContext(AuthContext);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Check if user is new (no preferences set)
  useEffect(() => {
    const checkUserPreferences = async () => {
      if (!User) return;

      try {
        // Check if user has preferences in MyList collection
        const myListDoc = await getDoc(doc(db, "MyList", User.uid));
        
        // If MyList doesn't exist or has no preferences, show the modal
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

  const closePreferencesModal = () => {
    setShowPreferencesModal(false);
  };

  const openPreferencesModal = () => {
    setShowPreferencesModal(true);
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        isNewUser,
        openPreferencesModal,
        closePreferencesModal
      }}
    >
      {children}
      {showPreferencesModal && User && (
        <UserPreferencesModal 
          user={User} 
          onClose={closePreferencesModal} 
        />
      )}
    </UserPreferencesContext.Provider>
  );
}; 