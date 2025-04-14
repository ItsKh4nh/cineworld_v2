import React, { useContext, useEffect, useRef, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import { useNavigate } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import toast from "react-hot-toast";

import { AuthContext } from "../contexts/UserContext";
import WelcomePageBanner from "/WelcomePageBanner.jpg";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Utilities
import { 
  signOutUser, 
  updateUserName, 
  updateProfilePicture, 
  changeUserPassword, 
  isGoogleAuthUser 
} from "../utils";
import { showSuccessToast, showErrorToast } from "../utils";

function Profile() {
  const { User } = useContext(AuthContext);

  const [profilePic, setProfilePic] = useState("");
  const [newProfilePicURL, setNewProfilePicURL] = useState("");
  const [newProfilePic, setNewProfilePic] = useState("");
  const [isUserNameChanged, setIsUserNameChanged] = useState(false);
  const [userName, setUserName] = useState("");
  const [IsMyListUpdated, setIsMyListUpdated] = useState(false);
  const [changeUsernameLoading, setChangeUsernameLoading] = useState(false);
  const [changeProfilePictureLoading, setChangeProfilePictureLoading] = useState(false);
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (User != null) {
      // If user has no photo URL, assign a random avatar from public folder
      if (!User.photoURL) {
        const avatarNum = Math.floor(Math.random() * 4) + 1;
        const randomAvatar = `/avatar${avatarNum}.png`;
        
        // Set the profile pic locally
        setProfilePic(randomAvatar);
        
        // Update the user's profile with the random avatar
        updateProfilePicture(randomAvatar).catch(error => {
          console.error("Error setting default avatar:", error);
        });
      } else {
        setProfilePic(User.photoURL);
      }
      
      // Check if user is signed in with Google
      setIsGoogleAccount(isGoogleAuthUser(User));
    }
  }, [User]);

  useEffect(() => {
    if (User) {
      setUserName(User.displayName || "");
    }
  }, [User]);

  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current.click();
  };

  const handleFileChange = (event) => {
    const fileObj = event.target.files[0];
    setNewProfilePic(fileObj);
    setNewProfilePicURL(URL.createObjectURL(fileObj));
    if (!fileObj) {
      return;
    }
    event.target.value = null;
  };

  const changeUsername = async () => {
    setChangeUsernameLoading(true);

    try {
      const success = await updateUserName(userName);
      if (success) {
        toast.success("Username updated successfully");
      } else {
        toast.error("Failed to update username");
      }
    } catch (error) {
      console.error("Error updating username:", error);
      toast.error("Failed to update username");
    } finally {
      setChangeUsernameLoading(false);
    }
  };

  const changeProfilePicture = async () => {
    setChangeProfilePictureLoading(true);

    try {
      const success = await updateProfilePicture(newProfilePicURL);
      if (success) {
        setProfilePic(newProfilePicURL);
        setNewProfilePicURL("");
        setNewProfilePic("");
        toast.success("Profile picture updated successfully");
      } else {
        toast.error("Failed to update profile picture");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error("Failed to update profile picture");
    } finally {
      setChangeProfilePictureLoading(false);
    }
  };

  const changePassword = async () => {
    setPasswordError("");
    
    // Validate password fields
    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (!newPassword) {
      setPasswordError("New password is required");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setChangePasswordLoading(true);

    try {
      const result = await changeUserPassword(currentPassword, newPassword);
      
      if (result.success) {
        // Clear fields and show success
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordFields(false);
        toast.success("Password updated successfully");
      } else {
        setPasswordError(result.error);
      }
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const SignOut = () => {
    signOutUser(navigate);
  };

  return (
    <div>
      <div
        className="min-h-screen pt-20 pb-10"
        style={{
          backgroundImage: `linear-gradient(0deg, hsl(0deg 0% 0% / 73%) 0%, hsl(0deg 0% 0% / 73%) 35%), url(${WelcomePageBanner})`,
        }}
      >
        <Fade>
          <div className="max-w-3xl mx-auto bg-[#000000bf] p-5 md:p-8 rounded-md">
            <h1 className="text-4xl text-white font-bold mb-6">
              Edit your Profile
            </h1>
            
            <div className="flex flex-col md:flex-row gap-8 mb-6">
              <div className="relative flex flex-col items-center">
                <div className="relative">
                  <img
                    className="h-28 w-28 rounded-full object-cover border-2 border-white"
                    src={profilePic || '/avatar1.png'}
                    alt="Profile"
                  />
                  <button 
                    onClick={handleClick}
                    className="absolute bottom-0 right-0 bg-white text-black p-1.5 rounded-full hover:bg-yellow-400 transition-colors"
                    title="Change avatar"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
                
                  <input
                    style={{ display: "none" }}
                    ref={inputRef}
                    type="file"
                    onChange={handleFileChange}
                  accept="image/*"
                />
                
                {newProfilePicURL && (
                  <div className="mt-4 text-center">
                    <p className="text-white text-sm mb-2">New avatar:</p>
                    <img className="h-20 w-20 rounded-full object-cover mx-auto" src={newProfilePicURL} alt="New profile" />
                    <div className="mt-2 flex gap-2 justify-center">
                      <button
                        onClick={changeProfilePicture}
                        disabled={changeProfilePictureLoading}
                        className="px-3 py-1 bg-cineworldYellow text-black text-sm rounded hover:bg-yellow-400 transition-colors"
                      >
                        {changeProfilePictureLoading ? "Updating..." : "Save"}
                      </button>
                      <button
                        onClick={() => setNewProfilePicURL("")}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="mb-4">
                  <label className="text-white text-lg font-medium mb-1 block">
                    Username
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                        setIsUserNameChanged(true);
                      }}
                      className="flex-1 rounded-md bg-stone-900 text-white border-gray-700 border p-2 focus:border-cineworldYellow focus:ring-cineworldYellow"
                      placeholder="Enter username"
                    />
                    {isUserNameChanged && (
                      <button
                        onClick={changeUsername}
                        disabled={changeUsernameLoading}
                        className="px-4 py-2 bg-cineworldYellow text-white rounded hover:bg-yellow-400 transition-colors"
                      >
                        {changeUsernameLoading ? "Saving..." : "Save"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-white text-lg font-medium mb-1 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={User ? User.email : ""}
                    className="w-full rounded-md bg-stone-900 text-white border-gray-700 border p-2"
                    disabled
                  />
                </div>

                <div className="mb-4">
                  <label className="text-white text-lg font-medium mb-1 block">
                    Unique ID
                  </label>
                  <input
                    type="text"
                    value={User ? User.uid : ""}
                    className="w-full rounded-md bg-stone-900 text-white border-gray-700 border p-2"
                    disabled
                  />
                </div>

                {/* Only show password change option for non-Google accounts */}
                {!isGoogleAccount && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowPasswordFields(!showPasswordFields)}
                      className="text-white hover:text-cineworldYellow flex items-center gap-2 transition-colors"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      {showPasswordFields ? "Hide Password Change" : "Change Password"}
                    </button>
                    
                    {showPasswordFields && (
                      <div className="mt-3 border border-gray-700 rounded-md p-4 bg-black/50">
                        {passwordError && (
                          <div className="mb-3 text-red-500 text-sm">
                            {passwordError}
                          </div>
                        )}
                        
                        <div className="mb-3">
                          <label className="text-white text-sm mb-1 block">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="w-full rounded-md bg-stone-900 text-white border-gray-700 border p-2 text-sm"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <label className="text-white text-sm mb-1 block">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full rounded-md bg-stone-900 text-white border-gray-700 border p-2 text-sm"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <label className="text-white text-sm mb-1 block">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full rounded-md bg-stone-900 text-white border-gray-700 border p-2 text-sm"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <button
                          onClick={changePassword}
                          disabled={changePasswordLoading}
                          className="w-full mt-2 px-4 py-2 bg-cineworldYellow text-white rounded hover:bg-yellow-400 transition-colors text-sm"
                        >
                          {changePasswordLoading ? "Updating Password..." : "Update Password"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Action buttons - reorganized */}
            <div className="flex justify-between mt-6">
              {/* Back to Home button on the left */}
              <button
                onClick={() => navigate("/")}
                className="flex items-center bg-cineworldYellow text-white px-6 py-2 rounded transition-colors hover:bg-white hover:text-cineworldYellow"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
                Back to Home
              </button>
              
              {/* Logout button on the right */}
                <button
                onClick={SignOut}
                className="flex items-center bg-red-700 border-white text-white px-6 py-2 rounded hover:bg-white hover:text-red-700 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  className="w-5 h-5 mr-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                Logout
                </button>
            </div>
          </div>
        </Fade>
      </div>
    </div>
  );
}

export default Profile;
