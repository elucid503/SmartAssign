import axios from 'axios';

const ApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Api = axios.create({
  baseURL: ApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
Api.interceptors.request.use((config) => {
  const Token = localStorage.getItem('token');
  if (Token) {
    config.headers.Authorization = `Bearer ${Token}`;
  }
  return config;
});

// Handle 401 errors
Api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default Api;
