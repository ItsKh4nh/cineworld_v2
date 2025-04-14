import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import { ClipLoader } from "react-spinners";
import { AuthContext } from "../contexts/UserContext";
import {
  emailSignUp,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "../controllers/auth.controller";

function SignUp() {
  const location = useLocation();
  const { User, setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ErrorMessage, setErrorMessage] = useState("");
  const [loader, setLoader] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);

  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (User) {
      navigate("/");
    }
  }, [User, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  const handleUsernameChange = async (e) => {
    const username = e.target.value;
    setUsername(username);

    // Only perform basic validation without checking Firebase
    // We'll check username uniqueness during account creation
    if (!username || username.trim().length === 0) {
      setFieldErrors((prev) => ({
        ...prev,
        username: "Username is required",
      }));
      return;
    }

    const trimmedUsername = username.trim();

    // Leading/trailing spaces check
    if (username !== trimmedUsername) {
      setFieldErrors((prev) => ({
        ...prev,
        username: "Username cannot start or end with spaces",
      }));
      return;
    }

    // Length validation (6-20 characters)
    if (trimmedUsername.length < 6 || trimmedUsername.length > 20) {
      setFieldErrors((prev) => ({
        ...prev,
        username: "Username must be between 6 and 20 characters",
      }));
      return;
    }

    // Character restriction check (only alphanumeric and underscore)
    const validUsernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!validUsernameRegex.test(trimmedUsername)) {
      setFieldErrors((prev) => ({
        ...prev,
        username: "Username can only contain letters, numbers, and underscores",
      }));
      return;
    }

    // Clear any previous errors if validation passes
    setFieldErrors((prev) => ({
      ...prev,
      username: "",
    }));
  };

  const handleEmailChange = async (e) => {
    const email = e.target.value;
    setEmail(email);

    const validation = await validateEmail(email);
    setFieldErrors((prev) => ({
      ...prev,
      email: validation.error || "",
    }));
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setPassword(password);

    const validation = validatePassword(password);
    setFieldErrors((prev) => ({
      ...prev,
      password: validation.error || "",
    }));
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPass = e.target.value;
    setConfirmPassword(confirmPass);

    const validation = validateConfirmPassword(password, confirmPass);
    setFieldErrors((prev) => ({
      ...prev,
      confirmPassword: validation.error || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    setErrorMessage("");
    setFieldErrors({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    // Validate username
    if (!username || username.trim().length === 0) {
      setFieldErrors((prev) => ({
        ...prev,
        username: "Username is required",
      }));
      setLoader(false);
      return;
    }

    const trimmedUsername = username.trim();

    // Leading/trailing spaces check
    if (username !== trimmedUsername) {
      setFieldErrors((prev) => ({
        ...prev,
        username: "Username cannot start or end with spaces",
      }));
      setLoader(false);
      return;
    }

    // Length validation (6-20 characters)
    if (trimmedUsername.length < 6 || trimmedUsername.length > 20) {
      setFieldErrors((prev) => ({
        ...prev,
        username: "Username must be between 6 and 20 characters",
      }));
      setLoader(false);
      return;
    }

    // Character restriction check (only alphanumeric and underscore)
    const validUsernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!validUsernameRegex.test(trimmedUsername)) {
      setFieldErrors((prev) => ({
        ...prev,
        username: "Username can only contain letters, numbers, and underscores",
      }));
      setLoader(false);
      return;
    }

    // Validate password first
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setFieldErrors((prev) => ({
        ...prev,
        password: passwordValidation.error,
      }));
      setLoader(false);
      return;
    }

    // Add confirm password validation
    const confirmPasswordValidation = validateConfirmPassword(
      password,
      confirmPassword
    );
    if (!confirmPasswordValidation.isValid) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: confirmPasswordValidation.error,
      }));
      setLoader(false);
      return;
    }

    // Validate email format
    const emailValidation = await validateEmail(email);
    if (!emailValidation.isValid) {
      setFieldErrors((prev) => ({
        ...prev,
        email: emailValidation.error,
      }));
      setLoader(false);
      return;
    }

    // Attempt to sign up
    const { user, error } = await emailSignUp(email, password, username);

    if (error) {
      if (error.includes("Username")) {
        setFieldErrors((prev) => ({ ...prev, username: error }));
      } else if (error.includes("Email")) {
        setFieldErrors((prev) => ({ ...prev, email: error }));
      } else {
        setErrorMessage(error);
      }
      setLoader(false);
      return;
    }

    if (user) {
      // Update the AuthContext immediately
      setUser({
        ...user,
        displayName: username.trim(), // Ensure displayName is set immediately
      });
      navigate("/");
    }
  };

  // Modify the input class assignment
  const getInputClass = (fieldName) => {
    return fieldErrors[fieldName]
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
                    {fieldErrors.username && (
                      <p className="mt-1 text-sm text-red-500">
                        {fieldErrors.username}
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
                    {fieldErrors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {fieldErrors.email}
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="mt-1 text-sm text-red-500">
                        {fieldErrors.password}
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                  <div>
                    {ErrorMessage && (
                      <h1 className="flex text-white font-bold p-4 bg-red-700 rounded text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6 mr-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                          />
                        </svg>

                        {ErrorMessage}
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
