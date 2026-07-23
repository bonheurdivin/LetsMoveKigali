import axios from "axios";

const API_URL = "http://10.151.0.207:5000";

export const api = axios.create({
  baseURL: API_URL,
});

export default api;