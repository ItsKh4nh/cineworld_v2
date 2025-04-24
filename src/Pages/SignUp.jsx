import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import { ClipLoader } from "react-spinners";
import { AuthContext } from "../contexts/UserContext";
import toast from "react-hot-toast";
import {
  emailSignUp,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "../controllers/auth.controller";

// Icons
import EyeOpenIcon from "../assets/eye-open-icon.svg?react";
import EyeClosedIcon from "../assets/eye-closed-icon.svg?react";
import ErrorIcon from "../assets/error-icon.svg?react";

function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { User, setUser } = useContext(AuthContext);

  // Form state
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [errorMessage, setErrorMessage] = useState("");
  const [loader, setLoader] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Validation state
  const [validationErrors, setValidationErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Redirect authenticated users to home page
  useEffect(() => {
    if (User) {
      navigate("/");
    }
  }, [User, navigate]);

  // Pre-fill email if provided in URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  // Form field validation handlers
  const handleUsernameChange = async (e) => {
    const username = e.target.value;
    setUsername(username);

    // Perform client-side username validation
    if (!username || username.trim().length === 0) {
      setValidationErrors((prev) => ({
        ...prev,
        username: "Username is required",
      }));
      return;
    }

    const trimmedUsername = username.trim();

    if (username !== trimmedUsername) {
      setValidationErrors((prev) => ({
        ...prev,
        username: "Username cannot start or end with spaces",
      }));
      return;
    }

    if (trimmedUsername.length < 6 || trimmedUsername.length > 20) {
      setValidationErrors((prev) => ({
        ...prev,
        username: "Username must be between 6 and 20 characters",
      }));
      return;
    }

    const validUsernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!validUsernameRegex.test(trimmedUsername)) {
      setValidationErrors((prev) => ({
        ...prev,
        username: "Username can only contain letters, numbers, and underscores",
      }));
      return;
    }

    // Clear error if validation passes
    setValidationErrors((prev) => ({
      ...prev,
      username: "",
    }));
  };

  const handleEmailChange = async (e) => {
    const email = e.target.value;
    setEmail(email);

    const validation = await validateEmail(email);
    setValidationErrors((prev) => ({
      ...prev,
      email: validation.error || "",
    }));
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setPassword(password);

    const validation = validatePassword(password);
    setValidationErrors((prev) => ({
      ...prev,
      password: validation.error || "",
    }));
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPass = e.target.value;
    setConfirmPassword(confirmPass);

    const validation = validateConfirmPassword(password, confirmPass);
    setValidationErrors((prev) => ({
      ...prev,
      confirmPassword: validation.error || "",
    }));
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    setErrorMessage("");
    setValidationErrors({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    // Comprehensive validation before submission
    // Username validation
    if (!username || username.trim().length === 0) {
      setValidationErrors((prev) => ({
        ...prev,
        username: "Username is required",
      }));
      setLoader(false);
      return;
    }

    const trimmedUsername = username.trim();

    if (username !== trimmedUsername) {
      setValidationErrors((prev) => ({
        ...prev,
        username: "Username cannot start or end with spaces",
      }));
      setLoader(false);
      return;
    }

    if (trimmedUsername.length < 6 || trimmedUsername.length > 20) {
      setValidationErrors((prev) => ({
        ...prev,
        username: "Username must be between 6 and 20 characters",
      }));
      setLoader(false);
      return;
    }

    const validUsernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!validUsernameRegex.test(trimmedUsername)) {
      setValidationErrors((prev) => ({
        ...prev,
        username: "Username can only contain letters, numbers, and underscores",
      }));
      setLoader(false);
      return;
    }

    // Password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setValidationErrors((prev) => ({
        ...prev,
        password: passwordValidation.error,
      }));
      setLoader(false);
      return;
    }

    // Confirm password validation
    const confirmPasswordValidation = validateConfirmPassword(
      password,
      confirmPassword
    );
    if (!confirmPasswordValidation.isValid) {
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: confirmPasswordValidation.error,
      }));
      setLoader(false);
      return;
    }

    // Email validation
    const emailValidation = await validateEmail(email);
    if (!emailValidation.isValid) {
      setValidationErrors((prev) => ({
        ...prev,
        email: emailValidation.error,
      }));
      setLoader(false);
      return;
    }

    // Attempt to create user account
    const { user, error } = await emailSignUp(email, password, username);

    if (error) {
      // Route specific errors to the appropriate field
      if (error.includes("Username")) {
        setValidationErrors((prev) => ({ ...prev, username: error }));
      } else if (error.includes("Email")) {
        setValidationErrors((prev) => ({ ...prev, email: error }));
      } else {
        setErrorMessage(error);
      }
      setLoader(false);
      return;
    }

    if (user) {
      // Update context and redirect to home page
      setUser({
        ...user,
        displayName: username.trim(),
      });
      toast.success("Account created successfully!", {
        position: "top-center",
        duration: 3000,
      });
      navigate("/");
    }
  };

  // Helper function for input field styling based on validation state
  const getInputClass = (fieldName) => {
    return validationErrors[fieldName]
      ? "bg-stone-700 text-white sm:text-sm rounded-sm border-2 border-red-700 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
      : "bg-stone-700 text-white sm:text-sm rounded-sm focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:text-white";
  };

  return (
    <section
      className="h-[100vh] bg-gray-500"
      style={{
        background: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.5)), url("/hero.png")`,
      }}
    >
      <div className="h-[100vh] flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-[#000000a2] rounded-lg shadow sm:my-0 md:mt-0 sm:max-w-lg xl:p-0 border-2 border-stone-800 lg:border-0">
          <Fade>
            <div>
              <div className="p-6 space-y-4 md:space-y-6 sm:p-12">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl dark:text-white">
                  Create a new account
                </h1>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 md:space-y-6"
                  action="#"
                >
                  <div>
                    <label
                      htmlFor="username"
                      className="block mb-2 text-sm font-medium text-white dark:text-white"
                    >
                      Username
                    </label>
                    <input
                      onChange={handleUsernameChange}
                      type="text"
                      name="username"
                      id="username"
                      className={getInputClass("username")}
                      placeholder="Enter your username"
                      required=""
                    />
                    {validationErrors.username && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.username}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-white dark:text-white"
                    >
                      Email
                    </label>
                    <input
                      onChange={handleEmailChange}
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      className={getInputClass("email")}
                      placeholder="name@example.com"
                      required=""
                    ></input>
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.email}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <label
                      htmlFor="password"
                      className="block mb-2 text-sm font-medium text-white dark:text-white"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        onChange={handlePasswordChange}
                        type={showPasswords ? "text" : "password"}
                        name="password"
                        id="password"
                        placeholder="••••••••"
                        className={getInputClass("password")}
                        required=""
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-white"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? (
                          <EyeClosedIcon className="w-5 h-5" />
                        ) : (
                          <EyeOpenIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.password}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <label
                      htmlFor="confirmPassword"
                      className="block mb-2 text-sm font-medium text-white dark:text-white"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        onChange={handleConfirmPasswordChange}
                        type={showPasswords ? "text" : "password"}
                        name="confirmPassword"
                        id="confirmPassword"
                        placeholder="••••••••"
                        className={getInputClass("confirmPassword")}
                        required=""
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-white"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? (
                          <EyeClosedIcon className="w-5 h-5" />
                        ) : (
                          <EyeOpenIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {validationErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                  <div>
                    {errorMessage && (
                      <h1 className="flex text-white font-bold p-4 bg-red-700 rounded text-center">
                        <ErrorIcon className="w-6 h-6 mr-1" />
                        {errorMessage}
                      </h1>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="remember"
                          aria-describedby="remember"
                          type="checkbox"
                          className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 "
                          required=""
                        ></input>
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="remember" className="text-gray-500">
                          Remember me
                        </label>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={`w-full text-white ${
                      loader
                        ? `bg-stone-700`
                        : `bg-red-800 focus:ring-4 focus:outline-none focus:ring-primary-300`
                    } font-medium rounded-sm text-sm px-5 py-2.5 text-center`}
                  >
                    {loader ? <ClipLoader color="#ff0000" /> : "Create now"}
                  </button>
                  <p className="text-sm font-light text-gray-500">
                    Already have one?{" "}
                    <Link
                      className="font-medium text-white hover:underline"
                      to={"/signin"}
                    >
                      Log in
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </Fade>
        </div>
      </div>
    </section>
  );
}

export default SignUp;
