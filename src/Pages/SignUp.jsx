import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import { ClipLoader } from "react-spinners";
import { AuthContext } from "../contexts/UserContext";
import {
  emailSignUp,
  validatePasswords,
  validateEmail,
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
  });

  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    setErrorMessage("");
    setFieldErrors({
      username: "",
      email: "",
      password: "",
    });

    // Validate email format first
    const emailValidation = await validateEmail(email);
    if (!emailValidation.isValid) {
      setFieldErrors((prev) => ({
        ...prev,
        email: emailValidation.error,
      }));
      setLoader(false);
      return;
    }

    // Validate passwords match
    if (!validatePasswords(password, confirmPassword)) {
      setFieldErrors((prev) => ({
        ...prev,
        password: "Passwords do not match!",
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
                      onChange={(e) => setUsername(e.target.value)}
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
                      Your email
                    </label>
                    <input
                      onChange={(e) => setEmail(e.target.value)}
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
                  <div>
                    <label
                      htmlFor="password"
                      className="block mb-2 text-sm font-medium text-white dark:text-white"
                    >
                      Password
                    </label>
                    <input
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      name="password"
                      id="password"
                      placeholder="••••••••"
                      className={getInputClass("password")}
                      required=""
                    ></input>
                    {fieldErrors.password && (
                      <p className="mt-1 text-sm text-red-500">
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block mb-2 text-sm font-medium text-white dark:text-white"
                    >
                      Confirm Password
                    </label>
                    <input
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      placeholder="••••••••"
                      className={
                        ErrorMessage
                          ? "bg-stone-700 text-white sm:text-sm rounded-sm border-2 border-red-700 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                          : "bg-stone-700 text-white sm:text-sm rounded-sm focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:text-white"
                      }
                      required=""
                    />
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
