import axios from "axios";

// Axios instance — base URL backend API se
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // cookies (refresh token) ke liye
  headers: { "Content-Type": "application/json" },
});

// ek flag taaki sirf ek baar token refresh ho
let isRefreshing = false;
let failedQueue = [];

// failed requests ko queue mein daalo aur token milne pe retry karo
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// request interceptor — access token har request ke header mein lagao
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// response interceptor — 401 milne pe token refresh karo aur retry karo
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // agar 401 aaya aur ye request already retry nahi ho rahi
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // pehle se refresh ho raha hai toh queue mein daal do
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = data.data?.accessToken;
        localStorage.setItem("accessToken", newToken);
        api.defaults.headers["Authorization"] = `Bearer ${newToken}`;
        processQueue(null, newToken);

        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        window.location.href = "/login"; // session khatam — login pe bhejo
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
