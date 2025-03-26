// Backend/config/routes/bookingRoutes.js
import express from "express";
import {
  filterServiceProviders,
  createBooking,
  retrieveBookings,
  updateBooking,
  deleteBooking,
  getAllBookings,
} from "../models/booking.js";

const router = express.Router();

// Filter service providers
router.get("/service-providers/filter", (req, res, next) => {
  console.log("Filter service providers route accessed");
  next();
}, filterServiceProviders);

// Create a new booking
router.post("/create", (req, res, next) => {
  console.log("Create booking route accessed");
  next();
}, createBooking);

// Retrieve all bookings for a customer
router.get("/customer/:customerID", (req, res, next) => {
  console.log("Retrieve bookings route accessed");
  next();
}, retrieveBookings);

// Update a booking
router.put("/:bookingID", (req, res, next) => {
  console.log("Update booking route accessed");
  next();
}, updateBooking);

// Delete a booking
router.delete("/:bookingID", (req, res, next) => {
  console.log("Delete booking route accessed");
  next();
}, deleteBooking);

// Retrieve all bookings (admin)
router.get("/all", getAllBookings);

export { router as bookingRouter };