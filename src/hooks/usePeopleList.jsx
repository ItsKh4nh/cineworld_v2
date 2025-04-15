import { useContext } from "react";
import { updateDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import { AuthContext } from "../contexts/UserContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function usePeopleList() {
  const { User } = useContext(AuthContext);
  const navigate = useNavigate();

  const showSignInPrompt = () => {
    toast.error("Please login to add people to your list", {
      duration: 3000,
      position: 'top-center',
      onClick: () => navigate("/signin")
    });
  };

  // Check if a person is in the user's list
  const isPersonInList = async (personId) => {
    try {
      if (!User || !User.uid) return false;
      
      const userDocRef = doc(db, "MyList", User.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const people = userData.people || [];
        return people.some(person => person.id === parseInt(personId) || person.id === personId);
      }
      return false;
    } catch (error) {
      console.error("Error checking if person is in list:", error);
      return false;
    }
  };

  // Add a person to the list
  const addPersonToList = async (person) => {
    try {
      if (!User) {
        showSignInPrompt();
        return false;
      }

      // Prepare person data
      const personData = {
        id: person.id,
        name: person.name,
        profile_path: person.profile_path,
        known_for_department: person.known_for_department,
        popularity: person.popularity,
        gender: person.gender,
        dateAdded: new Date().toISOString()
      };

      // Check if the person is already in the list
      const userDocRef = doc(db, "MyList", User.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const people = userData.people || [];
        
        // Check if person already exists
        if (people.some(p => p.id === personData.id)) {
          // Return false but don't show toast - handleListAction will handle this
          return false;
        }
        
        // Add person to list
        const updatedPeople = [...people, personData];
        await updateDoc(userDocRef, { people: updatedPeople });
      } else {
        // Create new document with person
        await setDoc(userDocRef, { 
          people: [personData],
          movies: [],
          lastUpdated: new Date().toISOString()
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error adding person to list:", error);
      // Don't show toast here - let handleListAction handle errors
      return false;
    }
  };

  // Remove a person from the list
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
        const updatedPeople = people.filter(p => p.id !== person.id);
        await updateDoc(userDocRef, { 
          people: updatedPeople,
          lastUpdated: new Date().toISOString() 
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error removing person from list:", error);
      // Don't show toast here - let handleListAction handle errors
      return false;
    }
  };

  return {
    isPersonInList,
    addPersonToList,
    removePersonFromList
  };
}

export default usePeopleList; 