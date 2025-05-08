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
  increment,
  runTransaction,
} from "firebase/firestore";
import { db, auth } from "../firebase/FirebaseConfig";

// --- Database Helper Functions ---

/**
 * Initializes empty collections for a new user
 * @param {string} uid - User ID
 */
const createUserCollections = async (uid) => {
  const emptyArray = [];
  await Promise.all([
    setDoc(doc(db, "MyList", uid), { movies: emptyArray }, { merge: true }),
    setDoc(
      doc(db, "InteractionList", uid),
      { movie_ids: emptyArray },
      { merge: true }
    ),
  ]);
};

/**
 * Gets next sequential user_id and increments counter
 * @returns {Promise<number>} The next available user_id
 */
const getNextUserId = async () => {
  const counterRef = doc(db, "Counters", "users");
  
  try {
    return await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let nextId = 1;
      if (counterDoc.exists()) {
        nextId = counterDoc.data().count + 1;
      }
      
      transaction.set(counterRef, { count: nextId }, { merge: true });
      return nextId;
    });
  } catch (error) {
    console.error("Error getting next user_id:", error);
    throw error;
  }
};

/**
 * Creates or updates user profile in Firestore
 * @param {string} uid - Firebase User ID
 * @param {Object} data - User profile data
 * @param {number} [sequentialId] - Sequential user ID (for new users)
 */
const createUserProfile = async (uid, data, sequentialId = null) => {
  const userData = {
    ...data,
  };
  
  if (sequentialId !== null) {
    userData.user_id = sequentialId;
  }
  
  await setDoc(
    doc(db, "Users", uid),
    userData,
    { merge: true }
  );
};

// --- Validation Functions ---

/**
 * Validates email format for sign-in
 * @param {string} email - Email to validate
 * @returns {Object} Validation result with isValid flag and error message
 */
export const validateSignInEmail = (email) => {
  if (!email || email.length === 0) {
    return { isValid: false, error: "Email is required" };
  }

  if (email !== email.trim()) {
    return {
      isValid: false,
      error: "Email cannot contain leading or trailing spaces",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: "Please enter a valid email address",
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates password format for sign-in
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid flag and error message
 */
export const validateSignInPassword = (password) => {
  if (!password || password.length === 0) {
    return { isValid: false, error: "Password is required" };
  }

  if (password !== password.trim()) {
    return {
      isValid: false,
      error: "Password cannot contain leading or trailing spaces",
    };
  }

  return { isValid: true, error: null };
};

/**
 * Checks if username is valid and available
 * @param {string} username - Username to validate
 * @returns {Promise<Object>} Validation result with isValid flag and error message
 */
export const validateUsername = async (username) => {
  if (!username || username.trim().length === 0) {
    return { isValid: false, error: "Username is required" };
  }

  try {
    const q = query(
      collection(db, "Users"),
      where("username", "==", username.trim())
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      if (auth.currentUser) {
        const matchingUsers = querySnapshot.docs.map((doc) => doc.id);
        if (!matchingUsers.includes(auth.currentUser.uid)) {
          return {
            isValid: false,
            error: "Username already taken. Please choose another.",
          };
        }
      } else {
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

/**
 * Validates email format and suggests corrections for common typos
 * @param {string} email - Email to validate
 * @returns {Promise<Object>} Validation result with isValid flag and error message
 */
export const validateEmail = async (email) => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: "Email is required" };
  }

  if (email !== email.trim()) {
    return {
      isValid: false,
      error: "Email cannot start or end with spaces",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: "Please enter a valid email address",
    };
  }

  // Check for common domain typos
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

/**
 * Validates password format for registration
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid flag and error message
 */
export const validatePassword = (password) => {
  if (!password || password.trim().length === 0) {
    return { isValid: false, error: "Password is required" };
  }

  if (password !== password.trim() || password.includes(" ")) {
    return { isValid: false, error: "Password cannot contain spaces" };
  }

  const nonEnglishRegex = /[^\x00-\x7F]+/;
  if (nonEnglishRegex.test(password)) {
    return {
      isValid: false,
      error: "Password can only contain English characters",
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates that password confirmation matches
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password to compare
 * @returns {Object} Validation result with isValid flag and error message
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim().length === 0) {
    return { isValid: false, error: "Please re-confirm your password" };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }

  return { isValid: true, error: null };
};

// --- Authentication Functions ---

/**
 * Handles email/password sign-in with validation
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Authentication result with user object or error
 */
export const emailSignIn = async (email, password) => {
  const emailValidation = validateSignInEmail(email);
  if (!emailValidation.isValid) {
    return { user: null, error: emailValidation.error };
  }

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
    // Generic error message for security reasons
    return { user: null, error: "Invalid email or password" };
  }
};

/**
 * Handles Google sign-in flow and user profile creation
 * @returns {Promise<Object>} Authentication result with user object or error
 */
export const googleSignIn = async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Initialize collections if new user
    const myListDoc = await getDoc(doc(db, "MyList", user.uid));
    const isNewUser = !myListDoc.exists();
    
    if (isNewUser) {
      const nextUserId = await getNextUserId();
      await createUserProfile(user.uid, {
        email: user.email,
        user_id: nextUserId,
      });
      await createUserCollections(user.uid);
    } else {
      await createUserProfile(user.uid, {
        email: user.email,
      });
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

/**
 * Handles email/password registration with profile creation
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} username - User username
 * @returns {Promise<Object>} Registration result with user object or error
 */
export const emailSignUp = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: username,
    });

    const nextUserId = await getNextUserId();
    
    await createUserProfile(user.uid, {
      email: email,
      username: username,
      displayName: username,
      user_id: nextUserId,
    });

    await createUserCollections(user.uid);

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Sends password reset email
 * @param {string} email - Email address to send reset link to
 * @returns {Promise<Object>} Result with success flag and optional error
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
