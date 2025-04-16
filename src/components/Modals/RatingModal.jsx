import React, { useState, useEffect } from "react";
import { imageURL2, statusOptions, scoreOptions } from "../../config/constants";

// Icons
import CloseIcon from "../../assets/close-icon.svg?react";

function RatingModal({ movie, onClose, onSave }) {
  const [status, setStatus] = useState(
    movie.userRating?.status || "Plan to Watch"
  );
  const [score, setScore] = useState(movie.userRating?.score || 5);
  const [note, setNote] = useState(movie.userRating?.note || "");
  const [isSaving, setIsSaving] = useState(false);

  // Check if this is an update (movie already has a userRating)
  const isUpdating = Boolean(movie.userRating);

  console.log("Movie in RatingModal:", movie);
  console.log("Movie genres in RatingModal:", movie.genres);

  // Check if score should be shown based on status
  const shouldShowScore = status === "Completed" || status === "Dropped";

  // Update score visibility when status changes
  useEffect(() => {
    // If changing from a status that shows score to one that doesn't,
    // we don't need to do anything special with the score value
    // as it will be ignored when saving anyway
  }, [status]);

  const handleSave = async () => {
    if (isSaving) return; // Prevent multiple submissions

    setIsSaving(true);

    // Preserve the original dateAdded if it exists
    const dateAdded = movie.userRating?.dateAdded || new Date().toISOString();

    // Create the userRating object based on status
    const userRating = {
      status,
      note,
      dateAdded,
    };

    // Only add score if status is Completed or Dropped
    if (shouldShowScore) {
      userRating.score = score;
    }

    // Make sure we keep all the movie properties including genres
    const movieWithRating = {
      ...movie,
      userRating,
      isInMyList: true, // Explicitly mark as in MyList
    };

    let success = false;
    let error = null;

    try {
      // Save the movie and await the result
      const result = await onSave(movieWithRating);
      success = result === true;
    } catch (err) {
      console.error("Error saving movie rating:", err);
      error = err.message || "Unknown error";
      success = false;
    } finally {
      // Always dispatch a custom event to notify listeners that a movie was added/updated
      window.dispatchEvent(
        new CustomEvent("ratingModalClosed", {
          detail: {
            movieId: movie.id,
            success,
            action: isUpdating ? "update" : "add",
            error,
          },
        })
      );

      setIsSaving(false);
    }

    // Return the success status
    return success;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {isUpdating ? "Update Your Rating" : "Add to MyList"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex mb-4">
          {movie.backdrop_path && (
            <img
              src={imageURL2 + movie.backdrop_path}
              alt={movie.title || movie.name}
              className="w-24 h-auto rounded mr-4"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold text-white">
              {movie.title || movie.name}
            </h3>
            <p className="text-gray-400 text-sm">
              {movie.release_date?.substring(0, 4) ||
                movie.first_air_date?.substring(0, 4) ||
                "N/A"}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {shouldShowScore && (
          <div className="mb-4">
            <label className="block text-white text-sm font-medium mb-2">
              Your Score
            </label>
            <select
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              {scoreOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            rows="3"
            placeholder="Add your thoughts about this movie..."
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 text-white bg-gray-700 rounded hover:bg-gray-600 transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className={`px-4 py-2 text-white ${
              isSaving ? "bg-gray-500" : "bg-red-700 hover:bg-red-600"
            } rounded transition-colors`}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : isUpdating ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RatingModal;
