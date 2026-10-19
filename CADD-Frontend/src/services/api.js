import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cadd_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function loginRequest(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}
export async function registerRequest(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}
export async function diagnoseRequest(file, notes = "") {
  const form = new FormData();
  form.append("image", file);
  if (notes) form.append("notes", notes);
  const { data } = await api.post("/predictions", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}
export async function historyRequest() {
  const { data } = await api.get("/predictions");
  return Array.isArray(data) ? data : (data.items || data.predictions || []);
}
export async function chatRequest(message, history = []) {
  const { data } = await api.post("/chat", { message, history });
  return data;
}
export default api;
