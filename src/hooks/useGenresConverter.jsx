import { genresList } from "../config/constants";

const useGenresConverter = () => {
  const convertGenre = (genreIds) => {
    // Check if genreIds exists before processing
    if (!genreIds || !Array.isArray(genreIds)) {
      return [];
    }
    
    // Take only first 3 genre IDs
    const limitedGenreIds = genreIds.slice(0, 3);
    
    // Map each ID to its name
    return limitedGenreIds
      .map(genreId => {
        const genre = genresList.find(g => g.id === genreId);
        return genre ? genre.name : null;
      })
      .filter(Boolean); // Remove any null values
  };

  return { convertGenre };
};

export default useGenresConverter;
