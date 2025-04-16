import React from "react";
import StarPlaceholderIcon from "../../assets/star-placeholder-icon.svg?react";
import StarIcon from "../../assets/star-icon.svg?react";

/**
 * Visual component that displays a rating on a scale of 0-10 with color-coded stars
 *
 * @param {number} rating - Rating value from 0-10
 * @param {string} size - Controls the visual size ('small', 'normal', 'large', 'extra-large')
 * @param {boolean} showDenominator - Controls whether to display "/10" after the rating
 */
function StarRating({ rating, size = "normal", showDenominator = false }) {
  const safeRating = rating || 0;
  const formattedRating = parseFloat(safeRating.toFixed(2)).toString();

  // Size configuration mapping for responsive design
  const sizeClasses = {
    small: { star: "w-5 h-5", text: "text-sm" },
    normal: { star: "w-6 h-6", text: "text-base" },
    large: { star: "w-7 h-7", text: "text-lg" },
    "extra-large": { star: "w-9 h-9", text: "text-2xl font-bold" },
  };

  const { star: starSizeClass, text: textSizeClass } =
    sizeClasses[size] || sizeClasses.normal;

  /**
   * Returns the appropriate star color based on rating value
   * Uses a color gradient from red (poor) to green (excellent)
   */
  const getStarColor = (rating) => {
    if (rating <= 2) return "#ff4545"; // Very poor rating
    if (rating <= 4) return "#ffa534"; // Below average
    if (rating <= 6) return "#ffe234"; // Average
    if (rating <= 8) return "#b7dd29"; // Good
    return "#57e32c"; // Excellent
  };

  // Handle case when no rating is available
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
