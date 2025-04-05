import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
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
import { db, auth } from "../firebase/FirebaseConfig";

// Create empty collections for new user
const createUserCollections = async (uid) => {
  const EmptyArray = [];
  await Promise.all([
    setDoc(doc(db, "MyList", uid), { movies: EmptyArray }, { merge: true }),
    setDoc(doc(db, "InteractionList", uid), { movie_ids: EmptyArray }, { merge: true }),
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

// Login Email validation
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

// Login Password validation
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

// Email/Password Login
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

// Google Login
export const googleSignIn = async () => {
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
  if (!username || username.trim().length === 0) {
    return { isValid: false, error: "Username is required" };
  }

  // Check if username already exists in Firestore
  try {
    // Get users with the same username
    const q = query(
      collection(db, "Users"),
      where("username", "==", username.trim())
    );
    const querySnapshot = await getDocs(q);

    // If we found matching users, check if they are different from current user
    if (!querySnapshot.empty) {
      // Check if current user is authenticated
      if (auth.currentUser) {
        const matchingUsers = querySnapshot.docs.map((doc) => doc.id);
        // If the username belongs to someone else
        if (!matchingUsers.includes(auth.currentUser.uid)) {
          return {
            isValid: false,
            error: "Username already taken. Please choose another.",
          };
        }
      } else {
        // No user is signed in, so any match means username is taken
        return {
          isValid: false,
          error: "Username already taken. Please choose another.",
        };
      }
    }

    return { isValid: true, error: null };
  } catch (error) {
    console.error("Error validating username:", error);
    return {
      isValid: false,
      error: "Error checking username. Please try again.",
    };
  }
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
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update profile with username
    await updateProfile(user, {
      displayName: username,
    });

    // Create user document in Firestore
    await createUserProfile(user.uid, {
      email: email,
      username: username,
      displayName: username,
    });

    // Create collections for the user
    await createUserCollections(user.uid);

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Password Reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
