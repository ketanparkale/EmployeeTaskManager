import axios from 'axios';

// One shared axios instance for the whole app.
// Change this URL if your backend runs on a different port.
const api = axios.create({
  baseURL: 'http://localhost:5286/api',
});

// Before every request, attach the JWT token (if we have one) so the
// backend knows who we are. The token is saved at login time.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server ever says "401 Unauthorized" (expired/invalid token),
// clear the saved session and send the user back to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
