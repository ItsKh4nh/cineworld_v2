import React, { useState, useEffect, useContext } from "react";

import { Transition } from "@headlessui/react";
import { getAuth, signOut } from "firebase/auth";
import { Fade } from "react-awesome-reveal";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../../contexts/UserContext";

function Navbar(props) {
  const { User } = useContext(AuthContext);
  const [profilePic, setProfilePic] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (User != null) {
      setProfilePic(User.photoURL);
      // Add fallback to email prefix only if displayName is null/undefined
      setUsername(User.displayName);
      console.log("User in Navbar:", User); // Add this for debugging
    }
    window.addEventListener("scroll", transitionNavBar);
    return () => {
      window.removeEventListener("scroll", transitionNavBar);
    };
  }, [User?.displayName]); // Add displayName as dependency to catch updates
  const [isOpen, setIsOpen] = useState(false);

  const [show, handleShow] = useState(false);
  const transitionNavBar = () => {
    if (window.scrollY > 80) {
      handleShow(true);
    } else {
      handleShow(false);
    }
  };

  const NavBlack = () => {
    handleShow(true);
  };
  const NavTransparent = () => {
    handleShow(false);
  };

  const SignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  return (
    <header
      className={
        props.playPage
          ? "fixed top-0 z-10 w-full backdrop-blur-sm"
          : "fixed top-0 z-10 w-full"
      }
    >
      <Fade>
        <nav
          className={`transition duration-500 ease-in-out  ${
            show && "transition duration-500 ease-in-out bg-black "
          } `}
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
                <div className="hidden md:block">
                  <div className="flex items-center ml-10 space-x-4">
                    <Link
                      to={"/"}
                      className="py-2 font-medium text-white transition ease-in-out delay-150 rounded-md cursor-pointer hover:text-red-800 lg:px-3 text-m"
                    >
                      Movies
                    </Link>

                    <Link
                      to={"/history"}
                      className="py-2 font-medium text-white transition ease-in-out delay-150 rounded-md cursor-pointer hover:text-red-800 lg:px-3 text-m"
                    >
                      History
                    </Link>

                    <Link
                      to={"/mylist"}
                      className="py-2 font-medium text-white transition ease-in-out delay-150 rounded-md cursor-pointer hover:text-red-800 lg:px-3 text-m"
                    >
                      MyList
                    </Link>
                  </div>
                </div>
              </div>

              <div className="ml-auto">
                <div className="flex">
                  {/* Search Icon */}
                  <Link to={"/search"}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="items-center w-10 h-10 pr-4 mt-auto mb-auto text-white hover:text-red-800 cursor-pointer"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </Link>

                  {User ? (
                    <a className="items-center hidden pr-4 mt-auto mb-auto text-base font-medium text-white transition ease-in-out delay-150 cursor-pointer hover:text-red-800 md:flex">
                      {username}
                    </a>
                  ) : null}

                  <div className="group inline-block relative transition ease-in-out delay-300">
                    <Link to={"/profile"}>
                      <img
                        className="h-10 w-10 rounded-full cursor-pointer"
                        src={
                          profilePic
                            ? `${User.photoURL}`
                            : `https://www.citypng.com/public/uploads/preview/profile-user-round-red-icon-symbol-download-png-11639594337tco5j3n0ix.png`
                        }
                        alt="Profile"
                      />
                    </Link>
                    <ul className="absolute hidden text-white pt-1 right-0 group-hover:block transition ease-in-out delay-150">
                      <li>
                        <Link
                          to={"/profile"}
                          className="cursor-pointer rounded-t bg-stone-900 font-bold hover:border-l-4 hover:bg-gradient-to-r from-[#ff000056] border-red-800 py-2 px-4 block whitespace-no-wrap transition ease-in-out delay-150"
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          to={"/"}
                          className="cursor-pointer bg-stone-900 font-bold hover:border-l-4 hover:bg-gradient-to-r from-[#ff000056] border-red-800 py-2 px-4 block whitespace-no-wrap transition ease-in-out delay-150"
                        >
                          Statistics
                        </Link>
                      </li>
                      <li>
                        <a
                          onClick={SignOut}
                          className="cursor-pointer rounded-b bg-stone-900 font-bold hover:border-l-4 hover:bg-gradient-to-r from-[#ff000056] border-red-800 py-2 px-4 block whitespace-no-wrap transition ease-in-out delay-150"
                        >
                          Logout
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex pl-4 -mr-2 md:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  type="button"
                  className="inline-flex items-center justify-center p-2 text-gray-400 bg-gray-900 rounded-md hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  aria-controls="mobile-menu"
                  aria-expanded="false"
                >
                  <span className="sr-only">Open main menu</span>
                  {!isOpen ? (
                    <svg
                      className="block w-6 h-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                      onClick={NavBlack}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="block w-6 h-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                      onClick={NavTransparent}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <Transition
            show={isOpen}
            enter="transition ease-out duration-100 transform"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75 transform"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            {(ref) => (
              <div className="md:hidden" id="mobile-menu">
                <div ref={ref} className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  <Link to={"/"}>
                    <a className="block px-3 py-2 text-base font-medium text-white rounded-md hover:bg-red-800">
                      Movies
                    </a>
                  </Link>

                  <Link to={"/history"}>
                    <a className="block px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-red-800 hover:text-white">
                      History
                    </a>
                  </Link>

                  <Link to={"/mylist"}>
                    <a className="block px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-red-800 hover:text-white">
                      MyList
                    </a>
                  </Link>

                  <Link to={"/"}>
                    <a className="block px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-red-800 hover:text-white">
                      Statistics
                    </a>
                  </Link>

                  <a
                    onClick={SignOut}
                    className="block px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-red-800 hover:text-white"
                  >
                    Logout
                  </a>
                </div>
              </div>
            )}
          </Transition>
        </nav>
      </Fade>
    </header>
  );
}

export default Navbar;
