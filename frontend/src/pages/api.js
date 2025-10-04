import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
});

// Add token automatically
API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});

export const getHistorySessions = () => API.get('/results/my-results');
export const deleteHistorySession = (id) => API.delete(`/results/${id}`);

export default API;
