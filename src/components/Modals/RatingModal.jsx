import React, { useState, useEffect } from "react";
import { imageURL2 } from "../../config/constants";

function RatingModal({ movie, onClose, onSave }) {
  const [status, setStatus] = useState("Plan to Watch");
  const [score, setScore] = useState(5);
  const [note, setNote] = useState("");

  const statusOptions = ["Plan to Watch", "Completed", "Dropped"];
  const scoreOptions = [
    { value: 1, label: "(1) Appalling" },
    { value: 2, label: "(2) Horrible" },
    { value: 3, label: "(3) Very Bad" },
    { value: 4, label: "(4) Bad" },
    { value: 5, label: "(5) Average" },
    { value: 6, label: "(6) Fine" },
    { value: 7, label: "(7) Good" },
    { value: 8, label: "(8) Very Good" },
    { value: 9, label: "(9) Great" },
    { value: 10, label: "(10) Masterpiece" },
  ];

  const handleSave = () => {
    const currentDate = new Date().toISOString();
    onSave({
      ...movie,
      userRating: {
        status,
        score,
        note,
        dateAdded: currentDate,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Add to My List</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
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
               movie.first_air_date?.substring(0, 4) || "N/A"}
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
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white bg-red-700 rounded hover:bg-red-600 transition-colors"
          >
            Add to My List
          </button>
        </div>
      </div>
    </div>
  );
}

export default RatingModal; 