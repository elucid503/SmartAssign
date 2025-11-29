import axios from 'axios';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api';

const API = axios.create({

  baseURL: API_URL,

  headers: {

    'Content-Type': 'application/json',

  },

});

// Add token to requests

API.interceptors.request.use((Config) => {

  const Token = localStorage.getItem('token');

  if (Token) {

    Config.headers.Authorization = `Bearer ${Token}`;

  }

  return Config;

});

// Custom event for auth state changes

export const AuthEvents = {

  OnLogout: new Set<() => void>(),

  TriggerLogout: () => {

    AuthEvents.OnLogout.forEach((callback) => callback());

  },

};

// Handle 401 errors

API.interceptors.response.use(

  (response) => response,

  (error) => {

    if (error.response?.status === 401) {

      // Only clear auth and redirect if we had a token (user was logged in)

      const HadToken = localStorage.getItem('token');

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (HadToken) {

        // Triggers logout in React context instead of hard redirect

        AuthEvents.TriggerLogout();

      }
      
    }

    return Promise.reject(error);

  }

);

export default API;