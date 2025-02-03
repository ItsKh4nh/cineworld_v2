import React from "react";
import StarRatingsLib from "react-star-ratings";

const StarRatings = ({ rating }) => {
  return (
    <StarRatingsLib
      rating={rating / 2}
      starRatedColor="red"
      numberOfStars={5}
      name="rating"
      starDimension="1.1rem"
      starSpacing="0.2rem"
    />
  );
};

export default StarRatings;
