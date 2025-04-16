import { useNavigate } from "react-router-dom";
import HomeIcon from "../assets/home-icon.svg?react";

/**
 * Error page component displayed when users navigate to a non-existent route
 * Provides a way for users to return to the home page
 */
function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <h1 className="text-white text-center text-9xl font-black mb-2">
          404 ERROR
        </h1>
        <h1 className="text-white text-center text-5xl font-bold mb-10">
          PAGE NOT FOUND
        </h1>
        <button
          onClick={() => {
            navigate("/");
          }}
          className="flex justify-center items-center w-11/12 ml-2 bg-cineworldYellow text-white font-medium sm:font-bold text-xl px-16 md:text-xl  py-3 rounded shadow hover:shadow-lg hover:bg-cineworldYellow outline-none focus:outline-none mr-3 mb-1 ease-linear transition-all duration-150"
        >
          <HomeIcon className="w-6 h-6 mr-2" />
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default ErrorPage;
