import {
  getAuth,
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
import { db } from "../firebase/FirebaseConfig";

// Create empty collections for new user
const createUserCollections = async (uid) => {
  const EmptyArray = [];
  await Promise.all([
    setDoc(doc(db, "MyList", uid), { movies: EmptyArray }, { merge: true }),
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

  // Uniqueness check in Firebase - only perform if we have auth
  try {
    const auth = getAuth();
    // Only check for uniqueness if we're in an authenticated context
    // During signup, we'll skip this check and verify during account creation
    if (auth.currentUser) {
      const usersRef = collection(db, "Users");
      const q = query(usersRef, where("username", "==", trimmedUsername));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return { isValid: false, error: "Username is already taken" };
      }
    }
  } catch (error) {
    console.error("Firebase username check error:", error);
    // Don't fail validation during signup - we'll check during account creation
    if (getAuth().currentUser) {
      return { isValid: false, error: "Error checking username availability" };
    }
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
  const auth = getAuth();
  const trimmedUsername = username.trim();

  try {
    // Create the user first
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    try {
      // Now that we're authenticated, check if username is already taken
      const usersRef = collection(db, "Users");
      const usernameQuery = query(
        usersRef,
        where("username", "==", trimmedUsername)
      );
      const usernameSnapshot = await getDocs(usernameQuery);

      if (!usernameSnapshot.empty) {
        // Username is taken, delete the user and return error
        await user.delete();
        return { user: null, error: "Username is already taken" };
      }

      // Update Auth profile
      await updateProfile(user, {
        displayName: trimmedUsername,
      });

      // Then update Firestore
      await createUserProfile(user.uid, {
        email,
        username: trimmedUsername,
        displayName: trimmedUsername,
      });
      await createUserCollections(user.uid);

      // Return the updated user object
      return {
        user: {
          ...user,
          displayName: trimmedUsername, // Ensure displayName is included
        },
        error: null,
      };
    } catch (error) {
      // If there's an error checking username or updating profile, delete the user
      console.error("Error during post-signup process:", error);
      await user.delete();
      return {
        user: null,
        error: "An error occurred during account creation. Please try again.",
      };
    }
  } catch (error) {
    console.error("Firebase signup error:", error);

    // Handle specific Firebase Auth errors
    if (error.code === "auth/email-already-in-use") {
      return { user: null, error: "Email is already registered" };
    } else if (error.code === "auth/invalid-email") {
      return { user: null, error: "Invalid email format" };
    } else if (error.code === "auth/weak-password") {
      return { user: null, error: "Password is too weak" };
    }

    return { user: null, error: error.message };
  }
};

// Password Reset
export const resetPassword = async (email) => {
  // Validate email
  const emailValidation = validateSignInEmail(email);
  if (!emailValidation.isValid) {
    return { success: false, error: emailValidation.error };
  }

  const auth = getAuth();
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (error) {
    console.error("Password reset error:", error);
    
    // Handle specific Firebase Auth errors
    if (error.code === "auth/user-not-found") {
      // For security reasons, don't reveal if the email exists or not
      return { success: true, error: null };
    } else if (error.code === "auth/invalid-email") {
      return { success: false, error: "Invalid email format" };
    } else if (error.code === "auth/too-many-requests") {
      return { success: false, error: "Too many requests. Please try again later." };
    }
    
    return { success: false, error: "Failed to send password reset email. Please try again." };
  }
};
