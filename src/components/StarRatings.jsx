import React from "react";

const StarRatings = ({ rating, size = "normal", showDenominator = false }) => {
  // Add a default value of 0 if rating is undefined or null
  const safeRating = rating || 0;
  
  // Format to 2 decimal places and remove unnecessary zeros
  const formattedRating = parseFloat(safeRating.toFixed(2)).toString();

  const getStarColor = (rating) => {
    if (rating <= 2) return "#ff4545"; // Red for very low ratings
    if (rating <= 4) return "#ffa534"; // Orange for low ratings
    if (rating <= 6) return "#ffe234"; // Yellow for medium ratings
    if (rating <= 8) return "#b7dd29"; // Light green for good ratings
    return "#57e32c"; // Bright green for excellent ratings
  };

  const starColor = getStarColor(safeRating);
  
  // Define size configurations
  const sizeConfig = {
    normal: {
      star: "w-5 h-5",
      text: "text-sm"
    },
    large: {
      star: "w-7 h-7",
      text: "text-base"
    },
    "extra-large": {
      star: "w-9 h-9",
      text: "text-xl font-bold"
    }
  };
  
  // Get the appropriate size configuration
  const { star: starSizeClass, text: textSizeClass } = sizeConfig[size] || sizeConfig.normal;

  return (
    <div className="flex items-center">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill={starColor} 
        className={`${starSizeClass} mr-1.5`}
        aria-hidden="true"
      >
        <path 
          fillRule="evenodd" 
          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" 
          clipRule="evenodd" 
        />
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
};

export default StarRatings;
