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

// Sign In Email validation
export const validateSignInEmail = (email) => {
  // Required field check
  if (!email || email.length === 0) {
    return { isValid: false, error: "Email is required" };
  }

  // Leading/trailing spaces check
  if (email !== email.trim()) {
    return {
      isValid: false,
      error: "Email cannot contain leading or trailing spaces",
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

  return { isValid: true, error: null };
};

// Sign In Password validation
export const validateSignInPassword = (password) => {
  // Required field check
  if (!password || password.length === 0) {
    return { isValid: false, error: "Password is required" };
  }

  // Check for spaces
  if (password !== password.trim()) {
    return {
      isValid: false,
      error: "Password cannot contain leading or trailing spaces",
    };
  }

  return { isValid: true, error: null };
};

// Email/Password Sign In
export const emailSignIn = async (email, password) => {
  // Validate email
  const emailValidation = validateSignInEmail(email);
  if (!emailValidation.isValid) {
    return { user: null, error: emailValidation.error };
  }

  // Validate password
  const passwordValidation = validateSignInPassword(password);
  if (!passwordValidation.isValid) {
    return { user: null, error: passwordValidation.error };
  }

  const auth = getAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user, error: null };
  } catch (error) {
    // Generic error message for security
    return { user: null, error: "Invalid email or password" };
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

// Password validation function
export const validatePassword = (password) => {
  // Required field check
  if (!password || password.trim().length === 0) {
    return { isValid: false, error: "Password is required" };
  }

  // Check for spaces
  if (password !== password.trim() || password.includes(" ")) {
    return { isValid: false, error: "Password cannot contain spaces" };
  }

  // Length validation
  if (password.length < 6 || password.length > 20) {
    return {
      isValid: false,
      error: "Password must be between 6 and 20 characters",
    };
  }

  // Check for non-English characters
  const nonEnglishRegex = /[^\x00-\x7F]+/;
  if (nonEnglishRegex.test(password)) {
    return {
      isValid: false,
      error: "Password can only contain English characters",
    };
  }

  return { isValid: true, error: null };
};

// Export the confirm password validation function
export const validateConfirmPassword = (password, confirmPassword) => {
  // Required field check
  if (!confirmPassword || confirmPassword.trim().length === 0) {
    return { isValid: false, error: "Please re-confirm your password" };
  }

  // Match validation
  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }

  return { isValid: true, error: null };
};

// Email/Password Sign Up
export const emailSignUp = async (email, password, username) => {
  const auth = getAuth();

  try {
    // Check username availability in Firestore
    const usersRef = collection(db, "Users");
    const usernameQuery = query(
      usersRef,
      where("username", "==", username.trim())
    );
    const usernameSnapshot = await getDocs(usernameQuery);

    if (!usernameSnapshot.empty) {
      return { user: null, error: "Username is already taken" };
    }

    // Check email existence in Firebase Auth
    const emailQuery = query(usersRef, where("email", "==", email));
    const emailSnapshot = await getDocs(emailQuery);

    if (!emailSnapshot.empty) {
      return { user: null, error: "Email is already registered" };
    }

    // If both checks pass, create the user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create user profile and collections
    await createUserProfile(user.uid, {
      email,
      username: username.trim(),
    });
    await createUserCollections(user.uid);

    return { user, error: null };
  } catch (error) {
    // Handle Firebase specific errors
    if (error.code === "auth/email-already-in-use") {
      return { user: null, error: "Email is already registered" };
    }
    return { user: null, error: error.message };
  }
};
