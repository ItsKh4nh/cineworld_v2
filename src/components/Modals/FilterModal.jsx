import React, { useState } from "react";

function FilterModal({ 
  isOpen, 
  onClose, 
  availableGenres, 
  selectedGenres, 
  setSelectedGenres, 
  onApplyStatusFilter,
  onResetFilters
}) {
  const [tempSelectedGenres, setTempSelectedGenres] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  
  // Initialize temporary state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTempSelectedGenres([...selectedGenres]);
    }
  }, [isOpen, selectedGenres]);
  
  if (!isOpen) return null;
  
  const handleApplyFilters = () => {
    // Apply the genre filter
    setSelectedGenres(tempSelectedGenres);
    
    // Apply the status filter
    onApplyStatusFilter(selectedStatus);
    
    // Close the modal
    onClose();
  };
  
  const handleResetFilters = () => {
    setTempSelectedGenres([]);
    setSelectedStatus("All");
    onResetFilters();
  };
  
  const handleGenreToggle = (genreId) => {
    if (tempSelectedGenres.includes(genreId)) {
      setTempSelectedGenres(tempSelectedGenres.filter(id => id !== genreId));
    } else {
      setTempSelectedGenres([...tempSelectedGenres, genreId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-70" onClick={onClose}></div>
      <div className="relative z-50 bg-gray-800 rounded-lg p-6 max-w-md mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium text-white">Filter Options</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Genre Filter Section */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Filter by Genre</h4>
          <div className="max-h-40 overflow-y-auto mb-2 grid grid-cols-2 gap-2">
            {availableGenres.map(genre => (
              <div key={genre.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`modal-genre-${genre.id}`}
                  checked={tempSelectedGenres.includes(genre.id)}
                  onChange={() => handleGenreToggle(genre.id)}
                  className="mr-2"
                />
                <label htmlFor={`modal-genre-${genre.id}`} className="text-white text-sm capitalize">
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
            <button
              onClick={() => setSelectedStatus("All")}
              className={`text-left text-white text-sm py-2 px-3 rounded border border-gray-700 ${selectedStatus === "All" ? "bg-red-600 hover:bg-red-700" : "hover:bg-gray-700"}`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus("Completed")}
              className={`text-left text-white text-sm py-2 px-3 rounded border border-gray-700 ${selectedStatus === "Completed" ? "bg-red-600 hover:bg-red-700" : "hover:bg-gray-700"}`}
            >
              Completed
            </button>
            <button
              onClick={() => setSelectedStatus("Plan to Watch")}
              className={`text-left text-white text-sm py-2 px-3 rounded border border-gray-700 ${selectedStatus === "Plan to Watch" ? "bg-red-600 hover:bg-red-700" : "hover:bg-gray-700"}`}
            >
              Plan to Watch
            </button>
            <button
              onClick={() => setSelectedStatus("Dropped")}
              className={`text-left text-white text-sm py-2 px-3 rounded border border-gray-700 ${selectedStatus === "Dropped" ? "bg-red-600 hover:bg-red-700" : "hover:bg-gray-700"}`}
            >
              Dropped
            </button>
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