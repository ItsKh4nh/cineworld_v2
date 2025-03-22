import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/UserContext';

/**
 * A banner component that displays when user is in guest mode
 * Can be placed in pages to encourage sign-up/sign-in
 */
function GuestModeBanner() {
  const { isGuestMode, User } = useContext(AuthContext);

  // Only show for guest users and not for authenticated users
  if (!isGuestMode || User) return null;
}

export default GuestModeBanner; 