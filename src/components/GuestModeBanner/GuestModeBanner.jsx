import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/UserContext';

/**
 * A banner component that displays when user is in guest mode
 * Can be placed in pages to encourage sign-up/sign-in
 */
function GuestModeBanner({ message = "Create an account to save your favorites and get personalized recommendations" }) {
  const { isGuestMode, User } = useContext(AuthContext);

  // Only show for guest users and not for authenticated users
  if (!isGuestMode || User) return null;

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-2 px-4 text-center relative border-t border-b border-gray-700">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-gray-300 text-xs sm:text-sm flex-grow">
          {message}
        </p>
        <div className="flex gap-2">
          <Link to="/signin">
            <button className="bg-cineworldYellow hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default GuestModeBanner; 