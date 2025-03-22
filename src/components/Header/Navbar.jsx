import React, { useState, useEffect, useContext } from "react";

import { Transition } from "@headlessui/react";
import { signOut, updateProfile } from "firebase/auth";
import { Fade } from "react-awesome-reveal";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { AuthContext } from "../../contexts/UserContext";
import { genresList } from "../../config/constants";
import { auth } from "../../firebase/FirebaseConfig";
import GuestModeBanner from "../GuestModeBanner/GuestModeBanner";

function Navbar(props) {
  const { User, isGuestMode, disableGuestMode } = useContext(AuthContext);
  const [profilePic, setProfilePic] = useState("");
  const [username, setUsername] = useState("");
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const location = useLocation();

  // Country list
  const countries = [
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "AU", name: "Australia" },
    { code: "FR", name: "France" },
    { code: "DE", name: "Germany" },
    { code: "IT", name: "Italy" },
    { code: "IN", name: "India" },
    { code: "JP", name: "Japan" },
    { code: "KR", name: "South Korea" },
    { code: "HK", name: "Hong Kong" },
    { code: "CN", name: "China" }
  ];

  const navigate = useNavigate();

  useEffect(() => {
    if (User != null) {
      // If user has no photo URL, assign a random avatar from public folder
      if (!User.photoURL) {
        const avatarNum = Math.floor(Math.random() * 4) + 1;
        const randomAvatar = `/avatar${avatarNum}.png`;
        
        // Update the user's profile with the random avatar
        updateProfile(auth.currentUser, {
          photoURL: randomAvatar
        }).then(() => {
          setProfilePic(randomAvatar);
        }).catch(error => {
          console.error("Error setting default avatar:", error);
        });
      } else {
        setProfilePic(User.photoURL);
      }
      
      // Add fallback to email prefix only if displayName is null/undefined
      setUsername(User.displayName);
    }
    window.addEventListener("scroll", transitionNavBar);
    return () => {
      window.removeEventListener("scroll", transitionNavBar);
    };
  }, [User]); 
  
  // Close mobile menu and dropdowns when location changes (user navigates)
  useEffect(() => {
    setIsOpen(false);
    setGenreDropdownOpen(false);
    setCountryDropdownOpen(false);
  }, [location]);
  
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
    if (isGuestMode) {
      disableGuestMode();
      navigate("/");
    } else {
      signOut(auth)
        .then(() => {
          navigate("/");
        })
        .catch((error) => {
          alert(error.message);
        });
    }
  };

  return (
    <header
      className={
        props.playPage
          ? "fixed top-0 z-50 w-full backdrop-blur-sm bg-black/70"
          : "fixed top-0 z-50 w-full"
      }
    >
      <GuestModeBanner message="" />
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

                    {/* Genre Dropdown */}
                    <div className="relative group">
                      <button
                        onClick={() => {
                          setGenreDropdownOpen(!genreDropdownOpen);
                          setCountryDropdownOpen(false);
                        }}
                        className="py-2 font-medium text-white transition ease-in-out delay-150 rounded-md cursor-pointer hover:text-cineworldYellow lg:px-3 text-m flex items-center"
                      >
                        Genre
                        <svg
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4 ml-1" 
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Genre Dropdown Menu */}
                      <div 
                        className={`absolute left-0 mt-2 w-96 rounded-md shadow-lg bg-black ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transition-opacity duration-150 ${genreDropdownOpen ? 'opacity-100' : 'opacity-0 invisible'}`}
                      >
                        <div className="py-1 max-h-96 overflow-y-auto grid grid-cols-3 gap-1">
                          {genresList.map((genre) => (
                            <Link
                              key={genre.id}
                              to={`/genre/${genre.name.toLowerCase().replace(/ /g, '-')}`}
                              className="block px-4 py-2 text-sm text-white hover:bg-cineworldYellow hover:text-white"
                              onClick={() => setGenreDropdownOpen(false)}
                            >
                              {genre.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Country Dropdown */}
                    <div className="relative group">
                      <button
                        onClick={() => {
                          setCountryDropdownOpen(!countryDropdownOpen);
                          setGenreDropdownOpen(false);
                        }}
                        className="py-2 font-medium text-white transition ease-in-out delay-150 rounded-md cursor-pointer hover:text-cineworldYellow lg:px-3 text-m flex items-center"
                      >
                        Country
                        <svg
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4 ml-1" 
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Country Dropdown Menu */}
                      <div 
                        className={`absolute left-0 mt-2 w-[28rem] rounded-md shadow-lg bg-black ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transition-opacity duration-150 ${countryDropdownOpen ? 'opacity-100' : 'opacity-0 invisible'}`}
                      >
                        <div className="py-1 max-h-96 overflow-y-auto grid grid-cols-3 gap-2 px-2">
                          {countries.map((country) => (
                            <Link
                              key={country.code}
                              to={`/country/${country.name.toLowerCase().replace(/ /g, '-')}`}
                              className="block px-4 py-2 text-sm text-white hover:bg-cineworldYellow hover:text-white whitespace-nowrap"
                              onClick={() => setCountryDropdownOpen(false)}
                            >
                              {country.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={"/mylist"}
                      className="py-2 font-medium text-white transition ease-in-out delay-150 rounded-md cursor-pointer hover:text-cineworldYellow lg:px-3 text-m"
                    >
                      MyList
                    </Link>
                  </div>
                </div>
              </div>

              <div className="ml-auto">
                <div className="flex items-center">
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

                  {/* Username and Avatar as a group */}
                  <div className="group inline-block relative transition ease-in-out delay-300">
                    {User ? (
                      <Link to="/profile" className="flex items-center">
                        <span className="hidden md:block pr-2 text-base font-medium text-white transition ease-in-out delay-150 cursor-pointer hover:text-cineworldYellow">
                          {username}
                        </span>
                        <img
                          className="h-10 w-10 rounded-full cursor-pointer"
                          src={profilePic || `/avatar${Math.floor(Math.random() * 4) + 1}.png`}
                          alt="Profile"
                        />
                      </Link>
                    ) : (
                      <Link to="/signin">
                        <button className="bg-cineworldYellow px-8 rounded-sm py-2 text-white text-base font-bold mr-4 lg:mr-0">
                          Login
                        </button>
                      </Link>
                    )}
                    
                    <ul className="absolute hidden text-white pt-1 right-0 group-hover:block transition ease-in-out delay-150">
                      {User ? (
                        <>
                          <li>
                            <Link
                              to={"/profile"}
                              className="cursor-pointer rounded-t bg-stone-900 font-bold hover:border-l-4 hover:bg-gradient-to-r from-[#ff000056] border-red-800 py-2 px-4 block whitespace-no-wrap transition ease-in-out delay-150"
                            >
                              Profile
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
                        </>
                      ) : null}
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
                  {/* Mobile Genre Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setGenreDropdownOpen(!genreDropdownOpen);
                        setCountryDropdownOpen(false);
                      }}
                      className="w-full text-left block px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-cineworldYellow hover:text-white"
                    >
                      Genre
                    </button>
                    
                    {genreDropdownOpen && (
                      <div className="pl-4 space-y-1">
                        <div className="grid grid-cols-2 gap-1">
                          {genresList.map((genre) => (
                            <Link
                              key={genre.id}
                              to={`/genre/${genre.name.toLowerCase().replace(/ /g, '-')}`}
                              className="block px-3 py-1 text-sm text-gray-400 hover:text-white"
                              onClick={() => {
                                setGenreDropdownOpen(false);
                                setIsOpen(false);
                              }}
                            >
                              {genre.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile Country Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setCountryDropdownOpen(!countryDropdownOpen);
                        setGenreDropdownOpen(false);
                      }}
                      className="w-full text-left block px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-cineworldYellow hover:text-white"
                    >
                      Country
                    </button>
                    
                    {countryDropdownOpen && (
                      <div className="pl-4 space-y-1">
                        <div className="grid grid-cols-2 gap-2 pr-2">
                          {countries.map((country) => (
                            <Link
                              key={country.code}
                              to={`/country/${country.name.toLowerCase().replace(/ /g, '-')}`}
                              className="block px-3 py-1 text-sm text-gray-400 hover:text-white whitespace-nowrap"
                              onClick={() => {
                                setCountryDropdownOpen(false);
                                setIsOpen(false);
                              }}
                            >
                              {country.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Link to={"/mylist"}>
                    <a 
                      className="block px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-cineworldYellow hover:text-white"
                      onClick={() => setIsOpen(false)}
                    >
                      MyList
                    </a>
                  </Link>
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
