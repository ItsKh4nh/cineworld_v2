import { useContext } from "react";
import { updateDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import { AuthContext } from "../contexts/UserContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

/**
 * Custom hook for managing people favorites list functionality
 * Provides methods to check, add and remove people from user's list
 */
function usePeopleList() {
  const { User } = useContext(AuthContext);
  const navigate = useNavigate();

  /**
   * Shows a toast prompting user to sign in
   * Used when unauthenticated users try to modify their list
   */
  const showSignInPrompt = () => {
    toast.error("Please login to add people to your list", {
      duration: 3000,
      position: "top-center",
      onClick: () => navigate("/signin"),
    });
  };

  /**
   * Checks if a person is in the user's favorites list
   * @param {number|string} personId - ID of the person to check
   * @returns {Promise<boolean>} True if the person is in the list
   */
  const isPersonInList = async (personId) => {
    try {
      if (!User || !User.uid) return false;

      const userDocRef = doc(db, "MyList", User.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const people = userData.people || [];
        return people.some(
          (person) => person.id === parseInt(personId) || person.id === personId
        );
      }
      return false;
    } catch (error) {
      console.error("Error checking if person is in list:", error);
      return false;
    }
  };

  /**
   * Adds a person to the user's favorites list
   * @param {Object} person - Person object with details to add
   * @returns {Promise<boolean>} True if successfully added
   */
  const addPersonToList = async (person) => {
    try {
      if (!User) {
        showSignInPrompt();
        return false;
      }

      // Prepare person data with only required fields and null checks
      const personData = {
        id: person.id,
        name: person.name || "",
        profile_path: person.profile_path || null,
        known_for_department: person.known_for_department || null,
        dateAdded: new Date().toISOString(),
      };

      const userDocRef = doc(db, "MyList", User.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const people = userData.people || [];

        // Skip if person already exists
        if (people.some((p) => p.id === personData.id)) {
          return false;
        }

        // Add person to list
        const updatedPeople = [...people, personData];
        await updateDoc(userDocRef, {
          people: updatedPeople,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        // Create new document if it doesn't exist yet
        await setDoc(userDocRef, {
          people: [personData],
          movies: [],
          lastUpdated: new Date().toISOString(),
        });
      }

      return true;
    } catch (error) {
      console.error("Error adding person to list:", error);
      return false;
    }
  };

  /**
   * Removes a person from the user's favorites list
   * @param {Object} person - Person object with id to remove
   * @returns {Promise<boolean>} True if successfully removed
   */
  const removePersonFromList = async (person) => {
    try {
      if (!User) {
        showSignInPrompt();
        return false;
      }

      const userDocRef = doc(db, "MyList", User.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const people = userData.people || [];

        // Filter out the person to remove
        const updatedPeople = people.filter((p) => p.id !== person.id);
        await updateDoc(userDocRef, {
          people: updatedPeople,
          lastUpdated: new Date().toISOString(),
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error("Error removing person from list:", error);
      return false;
    }
  };

  return {
    isPersonInList,
    addPersonToList,
    removePersonFromList,
  };
}

export default usePeopleList;
