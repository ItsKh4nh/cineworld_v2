import axios from "axios";
import { baseURL } from "./config/constants";

const instance = axios.create({
  baseURL: baseURL,
});
export default instance;
