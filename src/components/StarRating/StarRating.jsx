import React from 'react';

// Import SVGs as React Components
import StarPlaceholderIcon from '../../icons/star-placeholder-icon.svg?react';
import StarIcon from '../../icons/star-icon.svg?react';

/**
 * Star rating component that changes color based on rating value
 * @param {number} rating - Rating value from 0-10
 * @param {string} size - Size of the star ('small', 'normal', 'large', 'extra-large')
 * @param {boolean} showDenominator - Whether to show "/10" after the rating
 */
function StarRating({ rating, size = "normal", showDenominator = false }) {
  // Format rating to display
  const safeRating = rating || 0;
  const formattedRating = parseFloat(safeRating.toFixed(2)).toString();
  
  // Define size classes
  const sizeClasses = {
    small: {
      star: "w-5 h-5",
      text: "text-sm"
    },
    normal: {
      star: "w-6 h-6",
      text: "text-base"
    },
    large: {
      star: "w-7 h-7",
      text: "text-lg"
    },
    "extra-large": {
      star: "w-9 h-9",
      text: "text-2xl font-bold"
    }
  };
  
  // Get the appropriate size configuration
  const { star: starSizeClass, text: textSizeClass } = sizeClasses[size] || sizeClasses.normal;

  // Get star color based on rating
  const getStarColor = (rating) => {
    if (rating <= 2) return "#ff4545"; // Red for very low ratings
    if (rating <= 4) return "#ffa534"; // Orange for low ratings
    if (rating <= 6) return "#ffe234"; // Yellow for medium ratings
    if (rating <= 8) return "#b7dd29"; // Light green for good ratings
    return "#57e32c"; // Bright green for excellent ratings
  };
  
  // If no rating, return gray star with N/A
  if (!rating) {
    return (
      <div className="flex items-center">
        <StarPlaceholderIcon 
          className={`${starSizeClass} mr-1.5`}
          aria-hidden="true"
        />
        <span className={`text-white ${textSizeClass}`}>N/A</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center">
      <StarIcon 
        fill={getStarColor(safeRating)}
        className={`${starSizeClass} mr-1.5`}
        aria-hidden="true"
      />
      <span className={`text-white ${textSizeClass}`}>
        <span className="font-bold">{formattedRating}</span>
        {showDenominator && (
          <>
            <span> / </span>
            <span>10</span>
          </>
        )}
      </span>
    </div>
  );
}

export default StarRating; 