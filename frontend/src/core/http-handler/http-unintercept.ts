import axios from "axios";
import { CUSTOM_BASE_URL, BASE_URL } from "../constants/api";

const unincepaxios = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-type": "application/json" },
  timeout: 10000,
});

// No interceptors - for unauthenticated requests
export default unincepaxios;

