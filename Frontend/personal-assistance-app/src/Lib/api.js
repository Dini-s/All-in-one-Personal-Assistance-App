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
    const token = localStorage.getItem("token"); // Assuming you store JWT token in localStorage
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

export default api;