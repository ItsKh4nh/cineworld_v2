import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Transition } from "@headlessui/react";
import { Fade } from "react-awesome-reveal";
import { genresList, countriesList } from "../../config/constants";

// Icons
import ChevronDownIcon from "../../assets/chevron-down-icon.svg?react";
import SearchIcon from "../../assets/search-icon.svg?react";
import MenuIcon from "../../assets/menu-icon.svg?react";
import CloseIcon from "../../assets/close-icon.svg?react";

function NavbarWithoutUser() {
  const location = useLocation();

  // State definitions
  const [show, handleShow] = useState(false); // Controls navbar background
  const [isOpen, setIsOpen] = useState(false); // Controls mobile menu visibility
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  // Add/remove scroll event listener for navbar background effect
  useEffect(() => {
    window.addEventListener("scroll", transitionNavBar);
    return () => {
      window.removeEventListener("scroll", transitionNavBar);
    };
  }, []);

  // Close mobile menu and dropdowns when location changes (user navigates)
  useEffect(() => {
    setIsOpen(false);
    setGenreDropdownOpen(false);
    setCountryDropdownOpen(false);
  }, [location]);

  // Change navbar background based on scroll position
  const transitionNavBar = () => {
    if (window.scrollY > 80) {
      handleShow(true);
    } else {
      handleShow(false);
    }
  };

  // Helper functions for mobile menu
  const toggleMobileMenu = (isVisible) => {
    setIsOpen(isVisible);
    handleShow(isVisible); // Ensure navbar has background when menu is open
  };

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
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      </button>

                      {/* Genre Dropdown Menu */}
                      <div
                        className={`absolute left-0 mt-2 w-96 rounded-md shadow-lg bg-black ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transition-opacity duration-150 ${
                          genreDropdownOpen
                            ? "opacity-100"
                            : "opacity-0 invisible"
                        }`}
                      >
                        <div className="py-1 max-h-96 overflow-y-auto grid grid-cols-3 gap-1">
                          {genresList.map((genre) => (
                            <Link
                              key={genre.id}
                              to={`/genre/${genre.name
                                .toLowerCase()
                                .replace(/ /g, "-")}`}
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
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      </button>

                      {/* Country Dropdown Menu */}
                      <div
                        className={`absolute left-0 mt-2 w-[28rem] rounded-md shadow-lg bg-black ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transition-opacity duration-150 ${
                          countryDropdownOpen
                            ? "opacity-100"
                            : "opacity-0 invisible"
                        }`}
                      >
                        <div className="py-1 max-h-96 overflow-y-auto grid grid-cols-3 gap-2 px-2">
                          {countriesList.map((country) => (
                            <Link
                              key={country.code}
                              to={`/country/${country.name
                                .toLowerCase()
                                .replace(/ /g, "-")}`}
                              className="block px-4 py-2 text-sm text-white hover:bg-cineworldYellow hover:text-white whitespace-nowrap"
                              onClick={() => setCountryDropdownOpen(false)}
                            >
                              {country.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ml-auto">
                <div className="flex items-center">
                  {/* Search Icon */}
                  <Link to={"/search"}>
                    <SearchIcon className="items-center w-10 h-10 pr-4 mt-auto mb-auto text-white hover:text-cineworldYellow cursor-pointer" />
                  </Link>

                  <Link to="/signin">
                    <button className="bg-cineworldYellow px-8 rounded-sm py-2 text-white text-base font-bold mr-4 lg:mr-0">
                      Login
                    </button>
                  </Link>
                </div>
              </div>

              <div className="flex pl-4 -mr-2 md:hidden">
                <button
                  onClick={() => toggleMobileMenu(!isOpen)}
                  type="button"
                  className="inline-flex items-center justify-center p-2 text-gray-400 bg-gray-900 rounded-md hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  aria-controls="mobile-menu"
                  aria-expanded="false"
                >
                  <span className="sr-only">Open main menu</span>
                  {!isOpen ? (
                    <MenuIcon className="block w-6 h-6" aria-hidden="true" />
                  ) : (
                    <CloseIcon className="block w-6 h-6" aria-hidden="true" />
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
                              to={`/genre/${genre.name
                                .toLowerCase()
                                .replace(/ /g, "-")}`}
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
                          {countriesList.map((country) => (
                            <Link
                              key={country.code}
                              to={`/country/${country.name
                                .toLowerCase()
                                .replace(/ /g, "-")}`}
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

                  <Link to={"/signin"}>
                    <a
                      className="block px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-cineworldYellow hover:text-white"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
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

export default NavbarWithoutUser;
