import axios from "axios";
import { baseURL } from "../constants/constance";

const instance = axios.create({
  baseUrl: baseURL,
});

export default instance;
