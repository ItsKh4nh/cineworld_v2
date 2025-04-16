import React, { useState } from "react";
import { statusOptions } from "../../config/constants";

/**
 * Modal component for filtering movies by genre and status
 * Uses temporary state to allow users to preview and confirm filter selections
 */
function FilterModal({
  isOpen,
  onClose,
  availableGenres,
  selectedGenres,
  setSelectedGenres,
  onApplyStatusFilter,
  onResetFilters,
}) {
  // State for storing temporary selections (applied only when user confirms)
  const [tempSelectedGenres, setTempSelectedGenres] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Initialize temporary selections when modal opens to match current filters
  React.useEffect(() => {
    if (isOpen) {
      setTempSelectedGenres([...selectedGenres]);
    }
  }, [isOpen, selectedGenres]);

  // Early return if modal is closed
  if (!isOpen) return null;

  // Handler functions for filter actions
  const handleGenreToggle = (genreId) => {
    if (tempSelectedGenres.includes(genreId)) {
      setTempSelectedGenres(tempSelectedGenres.filter((id) => id !== genreId));
    } else {
      setTempSelectedGenres([...tempSelectedGenres, genreId]);
    }
  };

  const handleApplyFilters = () => {
    setSelectedGenres(tempSelectedGenres);
    onApplyStatusFilter(selectedStatus);
    onClose();
  };

  const handleResetFilters = () => {
    setTempSelectedGenres([]);
    setSelectedStatus("All");
    onResetFilters();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Modal backdrop with click-away functionality */}
      <div
        className="fixed inset-0 bg-black bg-opacity-70"
        onClick={onClose}
      ></div>

      {/* Modal content container */}
      <div className="relative z-50 bg-gray-800 rounded-lg p-6 max-w-md mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium text-white">Filter Options</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Genre Filter Section */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Filter by Genre</h4>
          <div className="max-h-40 overflow-y-auto mb-2 grid grid-cols-2 gap-2">
            {availableGenres.map((genre) => (
              <div key={genre.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`modal-genre-${genre.id}`}
                  checked={tempSelectedGenres.includes(genre.id)}
                  onChange={() => handleGenreToggle(genre.id)}
                  className="mr-2"
                />
                <label
                  htmlFor={`modal-genre-${genre.id}`}
                  className="text-white text-sm capitalize"
                >
                  {genre.name.toLowerCase()}
                </label>
              </div>
            ))}
          </div>
          <button
            onClick={() => setTempSelectedGenres([])}
            className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
          >
            Clear Genres
          </button>
        </div>

        {/* Status Filter Section */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Filter by Status</h4>
          <div className="flex flex-col space-y-2">
            {["All", ...statusOptions].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`text-left text-white text-sm py-2 px-3 rounded border border-gray-700 ${
                  selectedStatus === status
                    ? "bg-red-600 hover:bg-red-700"
                    : "hover:bg-gray-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Reset All Filters
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterModal;
