import axios from "axios";
import { baseURL } from "../shared/constants";

const instance = axios.create({
  baseUrl: baseURL,
});

export default instance;
