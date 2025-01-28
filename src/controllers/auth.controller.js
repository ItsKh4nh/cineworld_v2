import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";

// Create empty collections for new user
const createUserCollections = async (uid) => {
  const EmptyArray = [];
  await Promise.all([
    setDoc(doc(db, "MyList", uid), { movies: EmptyArray }, { merge: true }),
    setDoc(
      doc(db, "WatchedMovies", uid),
      { movies: EmptyArray },
      { merge: true }
    ),
    setDoc(
      doc(db, "LikedMovies", uid),
      { movies: EmptyArray },
      { merge: true }
    ),
  ]);
};

// Create or update user profile document
const createUserProfile = async (uid, data) => {
  await setDoc(
    doc(db, "Users", uid),
    {
      ...data,
      Uid: uid,
    },
    { merge: true }
  );
};

// Email/Password Sign In
export const emailSignIn = async (email, password) => {
  const auth = getAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Google Sign In
export const googleSignIn = async () => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Create/Update user profile
    await createUserProfile(user.uid, {
      email: user.email,
    });

    // Check if user collections exist
    const myListDoc = await getDoc(doc(db, "MyList", user.uid));
    if (!myListDoc.exists()) {
      await createUserCollections(user.uid);
    }

    return { user, error: null };
  } catch (error) {
    return {
      user: null,
      error: error.message,
      email: error.customData?.email,
      credential: GoogleAuthProvider.credentialFromError(error),
    };
  }
};

// Email/Password Sign Up
export const emailSignUp = async (email, password, username) => {
  const auth = getAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create user profile and collections
    await createUserProfile(user.uid, {
      email,
      username,
    });
    await createUserCollections(user.uid);

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Validate passwords match
export const validatePasswords = (password, confirmPassword) => {
  return password === confirmPassword;
};
