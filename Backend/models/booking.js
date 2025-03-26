// Backend/config/models/booking.js
import asyncHandler from "express-async-handler";
import ServiceProvider from "./ServiceProvider.js";
import mongoose from "mongoose";

// Define a simple Booking schema for Mongoose
const bookingSchema = new mongoose.Schema({
  customerID: { type: String, required: true },
  customerDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  providerID: { type: String, required: true },
  agreementDuration: { type: String, required: true },
  bookingService: { type: String, required: true },
  monthlyPayment: { type: Number, required: true },
  status: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED"],
    default: "PENDING",
  },
  bookingDate: { type: String, required: true },
  bookingTime: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  payments: [{ type: String }],
});

const Booking = mongoose.model("bookings", bookingSchema);

// Filter service providers based on serviceType
const filterServiceProviders = asyncHandler(async (req, res) => {
  try {
    console.log("=== FILTER SERVICE PROVIDERS STARTED ===");
    console.log("Request query:", req.query);

    const { serviceType } = req.query;
    console.log("Service type received:", serviceType);

    const filters = {};

    if (serviceType) {
      filters.serviceType = serviceType;
      console.log("Filter criteria:", filters);
    } else {
      console.log("Service type missing in request");
      return res.status(400).json({ message: "Service type is required" });
    }

    console.log("Querying database with filters...");
    const serviceProviders = await ServiceProvider.find(filters);
    console.log("Found service providers:", serviceProviders.length);

    res.status(200).json({
      message: "Service providers filtered successfully",
      serviceProviders,
    });
    console.log("=== FILTER SERVICE PROVIDERS COMPLETED ===");
  } catch (error) {
    console.error("Error filtering service providers:", error);
    res.status(500).json({
      message: "Error filtering service providers",
      error: error.message,
    });
  }
});

// Create a new booking
const createBooking = asyncHandler(async (req, res) => {
  try {
    console.log("=== CREATE BOOKING STARTED ===");
    console.log("Request body:", req.body);

    const {
      customerID,
      customerDetails,
      providerID,
      agreementDuration,
      bookingService,
      monthlyPayment,
      bookingDate,
      bookingTime,
    } = req.body;

    console.log("Validating required fields...");
    if (
      !customerID ||
      !customerDetails ||
      !providerID ||
      !bookingService ||
      !bookingDate ||
      !bookingTime
    ) {
      console.log(
        "Missing required fields - customerID:",
        customerID,
        "customerDetails:",
        customerDetails,
        "providerID:",
        providerID,
        "bookingService:",
        bookingService,
        "bookingDate:",
        bookingDate,
        "bookingTime:",
        bookingTime
      );
      return res.status(400).json({ message: "Missing required fields" });
    }

    console.log("Creating new booking...");
    const booking = await Booking.create({
      customerID,
      customerDetails,
      providerID,
      agreementDuration,
      bookingService,
      monthlyPayment: parseFloat(monthlyPayment),
      bookingDate,
      bookingTime,
      status: "PENDING",
      payments: [],
    });
    console.log("Booking created successfully:", booking);

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
    console.log("=== CREATE BOOKING COMPLETED ===");
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      message: "Error creating booking",
      error: error.message,
    });
  }
});

// Retrieve all bookings for a customer
const retrieveBookings = asyncHandler(async (req, res) => {
  try {
    console.log("=== RETRIEVE BOOKINGS STARTED ===");
    const { customerID } = req.params;
    console.log("Customer ID:", customerID);

    console.log("Querying bookings...");
    const bookings = await Booking.find({ customerID })
      .populate("providerID")
      .sort({ createdAt: -1 });
    console.log("Found bookings:", bookings.length);

    res.status(200).json({
      message: "Bookings retrieved successfully",
      bookings,
    });
    console.log("=== RETRIEVE BOOKINGS COMPLETED ===");
  } catch (error) {
    console.error("Error retrieving bookings:", error);
    res.status(500).json({
      message: "Error retrieving bookings",
      error: error.message,
    });
  }
});

// Retrieve all bookings (for admin)
const getAllBookings = asyncHandler(async (req, res) => {
  try {
    console.log("=== GET ALL BOOKINGS STARTED ===");
    console.log("Querying all bookings...");

    const bookings = await Booking.find()
      .populate("providerID")
      .sort({ createdAt: -1 });
    console.log("Found bookings:", bookings.length);

    res.status(200).json({
      message: "All bookings retrieved successfully",
      bookings,
    });
    console.log("=== GET ALL BOOKINGS COMPLETED ===");
  } catch (error) {
    console.error("Error retrieving all bookings:", error);
    res.status(500).json({
      message: "Error retrieving all bookings",
      error: error.message,
    });
  }
});

// Update a booking
const updateBooking = asyncHandler(async (req, res) => {
  try {
    console.log("=== UPDATE BOOKING STARTED ===");
    const { bookingID } = req.params;
    console.log("Booking ID:", bookingID);
    console.log("Update data:", req.body);

    // Validate bookingID
    if (!mongoose.Types.ObjectId.isValid(bookingID)) {
      console.log("Invalid booking ID:", bookingID);
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    // Create an update object with only the fields that are provided
    const updateData = {};
    if (req.body.agreementDuration) updateData.agreementDuration = req.body.agreementDuration;
    if (req.body.bookingService) updateData.bookingService = req.body.bookingService;
    if (req.body.monthlyPayment) updateData.monthlyPayment = parseFloat(req.body.monthlyPayment);
    if (req.body.bookingDate) updateData.bookingDate = req.body.bookingDate;
    if (req.body.bookingTime) updateData.bookingTime = req.body.bookingTime;
    if (req.body.status) updateData.status = req.body.status;

    console.log("Updating booking with data:", updateData);
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingID,
      updateData,
      { new: true, runValidators: true } // runValidators ensures schema validation
    );

    if (!updatedBooking) {
      console.log("Booking not found with ID:", bookingID);
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log("Booking updated successfully:", updatedBooking);
    res.status(200).json({
      message: "Booking updated successfully",
      updatedBooking,
    });
    console.log("=== UPDATE BOOKING COMPLETED ===");
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({
      message: "Error updating booking",
      error: error.message,
    });
  }
});

// Delete a booking
const deleteBooking = asyncHandler(async (req, res) => {
  try {
    console.log("=== DELETE BOOKING STARTED ===");
    const { bookingID } = req.params;
    console.log("Booking ID to delete:", bookingID);

    console.log("Deleting booking...");
    const deletedBooking = await Booking.findByIdAndDelete(bookingID);

    if (!deletedBooking) {
      console.log("Booking not found with ID:", bookingID);
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log("Booking deleted successfully");
    res.status(200).json({
      message: "Booking deleted successfully",
    });
    console.log("=== DELETE BOOKING COMPLETED ===");
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({
      message: "Error deleting booking",
      error: error.message,
    });
  }
});

export {
  filterServiceProviders,
  createBooking,
  retrieveBookings,
  getAllBookings, // Export the new function
  updateBooking,
  deleteBooking,
};