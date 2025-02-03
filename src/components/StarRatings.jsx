import React from "react";
import StarRatingsLib from "react-star-ratings";

const StarRatings = ({ rating }) => {
  const getStarColor = (rating) => {
    const normalizedRating = rating / 2;
    if (normalizedRating <= 1) return "#ff4545";
    if (normalizedRating <= 2) return "#ffa534";
    if (normalizedRating <= 3) return "#ffe234";
    if (normalizedRating <= 4) return "#b7dd29";
    return "#57e32c";
  };

  return (
    <StarRatingsLib
      rating={rating / 2}
      starRatedColor={getStarColor(rating)}
      numberOfStars={5}
      name="rating"
      starDimension="1.1rem"
      starSpacing="0.2rem"
    />
  );
};

export default StarRatings;
