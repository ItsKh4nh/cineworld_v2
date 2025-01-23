import axios from "axios";
import { baseURL } from "../../frontend/constants/constance";

const instance = axios.create({
  baseUrl: baseURL,
});

export default instance;
