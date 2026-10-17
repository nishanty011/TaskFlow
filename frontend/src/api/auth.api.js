import api from "./axios";

// Register karo — name, email, password, department
export const registerUser = (data) => api.post("/auth/register", data);

// OTP verify karo
export const verifyOtp = (data) => api.post("/auth/verify-otp", data);

// OTP dobara bhejo
export const resendOtp = (data) => api.post("/auth/resend-otp", data);

// Login karo — email & password
export const loginUser = (data) => api.post("/auth/login", data);

// Logout — cookie clear karo
export const logoutUser = () => api.post("/auth/logout");

// Apna profile fetch karo (auth check ke liye bhi useful)
export const getMe = () => api.get("/auth/me");

// Password bhool gaye — OTP bhejo
export const forgotPassword = (data) => api.post("/auth/forgot-password", data);

// OTP verify krke naya password set karo
export const resetPassword = (data) => api.post("/auth/reset-password", data);
