import React from 'react';

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
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="#6b7280"
          className={`${starSizeClass} mr-1.5`}
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
        </svg>
        <span className={`text-white ${textSizeClass}`}>N/A</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill={getStarColor(safeRating)}
        className={`${starSizeClass} mr-1.5`}
        aria-hidden="true"
      >
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
      </svg>
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