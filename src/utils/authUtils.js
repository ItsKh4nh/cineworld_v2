import { 
  signOut, 
  updateProfile, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from "firebase/auth";
import { auth } from "../firebase/FirebaseConfig";

/**
 * Sign out the current user and navigate to the specified path
 * @param {function} navigate - React Router's navigate function
 * @param {string} path - Path to navigate to after sign out, defaults to "/"
 * @returns {Promise<void>}
 */
export const signOutUser = async (navigate, path = "/") => {
  try {
    await signOut(auth);
    navigate(path);
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    return false;
  }
};

/**
 * Update user's display name
 * @param {string} displayName - New display name
 * @returns {Promise<boolean>} - Success or failure
 */
export const updateUserName = async (displayName) => {
  try {
    await updateProfile(auth.currentUser, { displayName });
    return true;
  } catch (error) {
    console.error("Error updating username:", error);
    return false;
  }
};

/**
 * Update user's profile picture
 * @param {string} photoURL - URL for the new profile picture
 * @returns {Promise<boolean>} - Success or failure
 */
export const updateProfilePicture = async (photoURL) => {
  try {
    await updateProfile(auth.currentUser, { photoURL });
    return true;
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return false;
  }
};

/**
 * Change user's password with reauthentication
 * @param {string} currentPassword - Current password for verification
 * @param {string} newPassword - New password to set
 * @returns {Promise<{success: boolean, error: string|null}>} 
 */
export const changeUserPassword = async (currentPassword, newPassword) => {
  try {
    // Reauthenticate user before changing password
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email, 
      currentPassword
    );
    
    await reauthenticateWithCredential(auth.currentUser, credential);
    
    // Update password
    await updatePassword(auth.currentUser, newPassword);
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating password:", error);
    
    if (error.code === "auth/wrong-password") {
      return { success: false, error: "Current password is incorrect" };
    }
    
    return { 
      success: false, 
      error: "Failed to update password. Try signing in again."
    };
  }
};

/**
 * Check if user is authenticated with Google
 * @param {object} user - Firebase user object
 * @returns {boolean} - Whether user is authenticated with Google
 */
export const isGoogleAuthUser = (user) => {
  if (!user || !user.providerData || user.providerData.length === 0) {
    return false;
  }
  
  return user.providerData.some(provider => provider.providerId === "google.com");
}; 