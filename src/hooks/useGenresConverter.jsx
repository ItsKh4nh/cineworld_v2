import { genresList } from "../config/constants";

const useGenresConverter = () => {
  const convertGenre = (genreIds) => {
    const genresConvertedList = [];
    genreIds
      .slice(0, 3)
      .map((genreId) =>
        genresList
          .filter((el) => el.id === genreId)
          .map((el) => genresConvertedList.push(el.name))
      );

    return genresConvertedList;
  };

  return { convertGenre };
};

export default useGenresConverter;
