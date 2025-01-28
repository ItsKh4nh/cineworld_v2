import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  setDoc,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
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

// Username validation function
export const validateUsername = async (username) => {
  // Required field check
  if (!username || username.trim().length === 0) {
    return { isValid: false, error: "Username is required" };
  }

  const trimmedUsername = username.trim();

  // Leading/trailing spaces check
  if (username !== trimmedUsername) {
    return {
      isValid: false,
      error: "Username cannot start or end with spaces",
    };
  }

  // Length validation (6-20 characters)
  if (trimmedUsername.length < 6 || trimmedUsername.length > 20) {
    return {
      isValid: false,
      error: "Username must be between 6 and 20 characters",
    };
  }

  // Character restriction check (only alphanumeric and underscore)
  const validUsernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!validUsernameRegex.test(trimmedUsername)) {
    return {
      isValid: false,
      error: "Username can only contain letters, numbers, and underscores",
    };
  }

  // Uniqueness check in Firebase
  try {
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("username", "==", trimmedUsername));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return { isValid: false, error: "Username is already taken" };
    }
  } catch (error) {
    console.error("Firebase username check error:", error);
    return { isValid: false, error: "Error checking username availability" };
  }

  return { isValid: true, error: null };
};

// Email validation function
export const validateEmail = async (email) => {
  // Required field check
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: "Email is required" };
  }

  // Leading/trailing spaces check - don't trim, just warn
  if (email !== email.trim()) {
    return {
      isValid: false,
      error: "Email cannot start or end with spaces",
    };
  }

  // Format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: "Please enter a valid email address",
    };
  }

  // Domain validation (basic check for common typos)
  const commonTypos = {
    "gmail.con": "gmail.com",
    "gamil.com": "gmail.com",
    "hotmail.con": "hotmail.com",
    "yahooo.com": "yahoo.com",
  };

  const domain = email.split("@")[1];
  if (commonTypos[domain]) {
    return {
      isValid: false,
      error: `Did you mean ${email.split("@")[0]}@${commonTypos[domain]}?`,
    };
  }

  // Check if email exists in Firebase
  try {
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return { isValid: false, error: "Email is already registered" };
    }
  } catch (error) {
    console.error("Firebase email check error:", error);
    return { isValid: false, error: "Error checking email availability" };
  }

  return { isValid: true, error: null };
};

// Email/Password Sign Up
export const emailSignUp = async (email, password, username) => {
  const auth = getAuth();

  // Validate username first
  const usernameValidation = await validateUsername(username);
  if (!usernameValidation.isValid) {
    return { user: null, error: usernameValidation.error };
  }

  // Validate email
  const emailValidation = await validateEmail(email);
  if (!emailValidation.isValid) {
    return { user: null, error: emailValidation.error };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Only create profile and collections if username validation passed
    await createUserProfile(user.uid, {
      email,
      username: username.trim(), // Store trimmed username
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
