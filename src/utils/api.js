import axios from 'axios';

const api = axios.create({
  baseURL: 'https://silver-server-1.onrender.com/api/health',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;