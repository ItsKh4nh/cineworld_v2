import { genresList } from "../config/constants";

/**
 * Custom hook that provides functionality to convert genre IDs to their corresponding names
 * @returns {Object} Object containing the convertGenre function
 */
const useGenresConverter = () => {
  /**
   * Converts an array of genre IDs to their corresponding genre names
   * Limits output to first 3 genres for UI consistency
   *
   * @param {Array<number>} genreIds - Array of genre IDs to convert
   * @returns {Array<string>} Array of genre names (max 3)
   */
  const convertGenre = (genreIds) => {
    if (!genreIds || !Array.isArray(genreIds)) {
      return [];
    }

    const limitedGenreIds = genreIds.slice(0, 3);

    return limitedGenreIds
      .map((genreId) => {
        const genre = genresList.find((g) => g.id === genreId);
        return genre ? genre.name : null;
      })
      .filter(Boolean);
  };

  return { convertGenre };
};

export default useGenresConverter;
