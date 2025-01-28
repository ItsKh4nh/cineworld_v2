import React, { useContext, useState } from "react";
import { updateDoc, doc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";
import { AuthContext } from "../contexts/UserContext";
import toast, { Toaster } from "react-hot-toast";

function useUpdateMyList() {
  const { User } = useContext(AuthContext);
  const [IsMyListUpdates, setIsMyListUpdates] = useState(false);

  function notify() {
    toast.success("  Movie added to MyList  ");
  }
  function alertError(message) {
    toast.error(message);
  }

  const addToMyList = (movie) => {
    updateDoc(doc(db, "MyList", User.uid), { movies: arrayUnion(movie) })
      .then(() => {
        console.log("Data added to MyList");
        notify();
        setIsMyListUpdates(true);
      })
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
        alertError(error.message);
      });
  };

  const removeFromMyList = (movie) => {
    updateDoc(doc(db, "MyList", User.uid), { movies: arrayRemove(movie) })
      .then(() => {
        toast.success(" Movie removed from MyList  ");
        setIsMyListUpdates(true);
      })
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
      });
  };

  const PopupMessage = (
    <Toaster
      toastOptions={{
        style: {
          padding: "1.5rem",
          backgroundColor: "#f4fff4",
          borderLeft: "6px solid lightgreen",
        },
      }}
    />
  );

  return { addToMyList, removeFromMyList, PopupMessage, IsMyListUpdates };
}

export default useUpdateMyList;
