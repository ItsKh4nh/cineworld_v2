import axios from "axios";
import { baseUrl } from "./config/constants";

const instance = axios.create({
  baseURL: baseUrl,
});
export default instance;
