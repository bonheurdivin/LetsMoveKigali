import axios from "axios";

const API_URL = "https://letsmovekigali-backend.onrender.com";

export const api = axios.create({
  baseURL: API_URL,
});

export default api;