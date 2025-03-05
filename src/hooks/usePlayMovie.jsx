import { useNavigate } from "react-router-dom";

function usePlayMovie() {
  const navigate = useNavigate();

  const playMovie = (movie, from) => {
    navigate(`/play/${movie.id}`, { replace: true, state: { From: from } });
  };

  return { playMovie };
}

export default usePlayMovie;
