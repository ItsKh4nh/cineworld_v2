import React, { useState } from "react";
import { resetPassword } from "../../controllers/auth.controller";
import { ClipLoader } from "react-spinners";

// Icons
import { ReactComponent as CloseIcon } from "../../assets/close-icon.svg";

/**
 * ForgotPasswordModal Component
 *
 * Provides a user interface for requesting password reset via email.
 * Handles form submission, displays loading state, and shows appropriate
 * success/error messages to guide the user through the process.
 */
function ForgotPasswordModal({ onClose }) {
  // Form state
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });
  const [emailSent, setEmailSent] = useState(false);

  /**
   * Handles the password reset request submission
   * Communicates with auth controller and updates UI based on response
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", isError: false });

    // Attempt to send reset password email
    const { success, error } = await resetPassword(email);

    if (success) {
      setEmailSent(true);
      // Generic success message for security (doesn't confirm email existence)
      setMessage({
        text: "If an account exists with this email, a password reset link has been sent.",
        isError: false,
      });
    } else {
      setMessage({
        text: error || "Failed to send reset email. Please try again.",
        isError: true,
      });
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Reset Password</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        {emailSent ? (
          // Success state - show confirmation and close button
          <div>
            <div
              className={`p-4 mb-4 rounded ${
                message.isError ? "bg-red-800" : "bg-green-800"
              }`}
            >
              <p className="text-white">{message.text}</p>
            </div>
            <p className="text-gray-300 mb-4">
              Please check your email inbox and follow the instructions to reset
              your password.
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-white bg-red-700 rounded hover:bg-red-600 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          // Initial state - show email input form
          <form onSubmit={handleSubmit}>
            <p className="text-gray-300 mb-4">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            {message.text && (
              <div
                className={`p-4 mb-4 rounded ${
                  message.isError ? "bg-red-800" : "bg-green-800"
                }`}
              >
                <p className="text-white">{message.text}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 px-4 py-2 text-white bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-red-700 rounded hover:bg-red-600 transition-colors flex items-center justify-center min-w-[100px]"
                disabled={loading}
              >
                {loading ? (
                  <ClipLoader color="#ffffff" size={20} />
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
