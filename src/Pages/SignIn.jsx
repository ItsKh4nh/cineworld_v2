import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import { ClipLoader } from "react-spinners";
import { AuthContext } from "../contexts/UserContext";
import { emailSignIn, googleSignIn } from "../controllers/auth.controller";
import ForgotPasswordModal from "../components/Modals/ForgotPasswordModal";
import toast from "react-hot-toast";

// Icons
import EyeOpenIcon from "../assets/eye-open-icon.svg?react";
import EyeClosedIcon from "../assets/eye-closed-icon.svg?react";
import ErrorIcon from "../assets/error-icon.svg?react";

function SignIn() {
  const { User } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [errorMessage, setErrorMessage] = useState("");
  const [loader, setLoader] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Redirect authenticated users to home page
  useEffect(() => {
    if (User) {
      navigate("/");
    }
  }, [User, navigate]);

  // Handle email/password sign in
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    setErrorMessage("");

    const { user, error } = await emailSignIn(email, password);

    if (error) {
      setErrorMessage(error);
      setLoader(false);
      return;
    }

    if (user) {
      toast.success("Login successful!", {
        position: "top-center",
        duration: 3000,
      });
      navigate("/");
    }
  };

  // Handle Google sign in
  const signinWithGoogle = async (e) => {
    e.preventDefault();
    setLoader(true);

    const { user, error } = await googleSignIn();

    if (error) {
      setErrorMessage(error);
      setLoader(false);
      return;
    }

    if (user) {
      toast.success("Login successful!", {
        position: "top-center",
        duration: 3000,
      });
      navigate("/");
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <section
      className="h-[100vh] bg-gray-50 dark:bg-gray-900"
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
                  Log in to your account
                </h1>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 md:space-y-6"
                  action="#"
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-white dark:text-white"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className={
                        errorMessage
                          ? "bg-stone-700 text-white sm:text-sm rounded-sm focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 border-2 border-red-700  dark:placeholder-white dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 placeholder:text-white"
                          : "bg-stone-700 text-white sm:text-sm rounded-sm focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:placeholder-white dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 placeholder:text-white"
                      }
                      placeholder="name@example.com"
                      required=""
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block mb-2 text-sm font-medium text-white dark:text-white"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        placeholder="••••••••"
                        className={
                          errorMessage
                            ? "bg-stone-700 text-white sm:text-sm rounded-sm focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  border-2 border-red-700 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 placeholder:text-white"
                            : "bg-stone-700 text-white sm:text-sm rounded-sm focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 placeholder:text-white"
                        }
                        required=""
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-white"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <EyeClosedIcon className="w-5 h-5" />
                        ) : (
                          <EyeOpenIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Display error message if any */}
                  {errorMessage && (
                    <div className="flex text-white font-bold p-4 bg-red-700 rounded text-center">
                      <ErrorIcon className="w-6 h-6 mr-1" />
                      {errorMessage}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="remember"
                          aria-describedby="remember"
                          type="checkbox"
                          className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                          required=""
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="remember"
                          className="text-gray-500 dark:text-gray-300"
                        >
                          Remember me
                        </label>
                      </div>
                    </div>
                    <div className="text-sm">
                      <button
                        type="button"
                        onClick={() => setShowForgotPasswordModal(true)}
                        className="font-medium text-white hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  {/* Primary login button */}
                  <button
                    type="submit"
                    className={`w-full text-white ${
                      loader
                        ? `bg-stone-700`
                        : `bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-primary-300`
                    } transition ease-in-out font-medium rounded-sm text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800`}
                  >
                    {loader ? <ClipLoader color="#ff0000" /> : `Log in`}
                  </button>

                  {/* Google login button */}
                  <button
                    onClick={signinWithGoogle}
                    className={`flex justify-center items-center w-full text-white ${
                      loader
                        ? `bg-stone-700`
                        : `bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-primary-300`
                    } transition ease-in-out font-medium rounded-sm text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:focus:ring-primary-800`}
                  >
                    {loader ? (
                      <ClipLoader color="#ff0000" />
                    ) : (
                      <>
                        <img
                          className="w-8"
                          src="/GoogleLogo.png"
                          alt="Google logo"
                        />
                        <p className="ml-1">Log in with Google</p>
                      </>
                    )}
                  </button>

                  <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                    Don't have an account yet?{" "}
                    <Link
                      className="font-medium text-white hover:underline dark:text-primary-500"
                      to={"/signup"}
                    >
                      Sign up
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </Fade>
        </div>
      </div>

      {/* Forgot password modal */}
      {showForgotPasswordModal && (
        <ForgotPasswordModal
          onClose={() => setShowForgotPasswordModal(false)}
        />
      )}
    </section>
  );
}

export default SignIn;
