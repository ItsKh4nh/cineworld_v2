import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Fade } from "react-awesome-reveal";

function SimpleNavbar() {
  const [show, handleShow] = useState(false);
  
  const transitionNavBar = () => {
    if (window.scrollY > 100) {
      handleShow(true);
    } else {
      handleShow(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", transitionNavBar);
    return () => {
      window.removeEventListener("scroll", transitionNavBar);
    };
  }, []);

  return (
    <header className="fixed top-0 z-10 w-full">
      <Fade>
        <nav
          className={`transition duration-500 ease-in-out ${
            show && "transition duration-500 ease-in-out bg-black"
          }`}
        >
          <div className="px-4 mx-auto max-w-8xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Link to="/">
                    <img
                      className="h-6 cursor-pointer w-18"
                      src="/cineworld-logo.png"
                      alt="CINEWORLD"
                    />
                  </Link>
                </div>
              </div>

              <div className="ml-auto">
                <div className="flex items-center">
                  <Link to="/signin">
                    <button className="bg-cineworldYellow px-8 rounded-sm py-2 text-white text-base font-bold mr-4 lg:mr-0">
                      Login
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </Fade>
    </header>
  );
}

export default SimpleNavbar; 