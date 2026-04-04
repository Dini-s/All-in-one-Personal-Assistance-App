// Frontend/personal-assistance-app/src/Lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8070", // Your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include authentication token if needed
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Filter service providers
export const filterServiceProviders = (filters) =>
  api.get("/home/booking/service-providers/filter", { params: filters });

// Create a new booking
export const createBooking = (bookingData) =>
  api.post("/home/booking/create", bookingData);

// Retrieve all bookings for a customer
export const retrieveBookings = (customerID) =>
  api.get(`/home/booking/customer/${customerID}`);

// Retrieve all bookings (admin)
export const getAllBookings = () => api.get("/home/booking/all");

// Update a booking
export const updateBooking = (bookingID, updatedData) =>
  api.put(`/home/booking/${bookingID}`, updatedData);

// Delete a booking
export const deleteBooking = (bookingID) =>
  api.delete(`/home/booking/${bookingID}`);

// Payments (offline flow)
export const createOfflinePayment = (payload) =>
  api.post("/api/payment/make-payment", payload);

export const getPaymentHistory = (params = {}) =>
  api.get("/api/payment/history", { params });

export const requestRefund = (payload) =>
  api.post("/api/payment/refund-request", payload);

export const getRefundHistory = () =>
  api.get("/api/payment/refund-history");

export const getPaymentById = (paymentId) =>
  api.get(`/api/payment/${paymentId}`);

export const cancelPayment = (paymentId) =>
  api.patch(`/api/payment/${paymentId}/cancel`);

export const verifyPayment = (paymentId) =>
  api.patch(`/api/payment/${paymentId}/verify`);

export const rejectPayment = (paymentId) =>
  api.patch(`/api/payment/${paymentId}/reject`);

export const getAdminRefunds = () =>
  api.get("/api/payment/admin/refunds");

export const getAdminPayments = () =>
  api.get("/api/payment/admin/payments");

export const approveAdminRefund = (refundId) =>
  api.patch(`/api/payment/admin/refunds/${refundId}/approve`);

export const rejectAdminRefund = (refundId) =>
  api.patch(`/api/payment/admin/refunds/${refundId}/reject`);

export default api;