// Frontend/personal-assistance-app/src/Pages/MyBookings.js
import React, { useState, useEffect } from "react";
import { retrieveBookings, updateBooking, deleteBooking } from "../../Lib/api";

const staticUser = {
  id: "static-user-123",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+94 123 456 789",
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editFormData, setEditFormData] = useState({
    agreementDuration: "",
    monthlyPayment: "",
    bookingDate: "",
    bookingTime: "",
  });

  // Fetch bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await retrieveBookings(staticUser.id);
        setBookings(response.data.bookings || []);
      } catch (err) {
        setError("Failed to fetch bookings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleEditOpen = (booking) => {
    setSelectedBooking(booking);
    setEditFormData({
      agreementDuration: booking.agreementDuration,
      monthlyPayment: booking.monthlyPayment,
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
    });
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setSelectedBooking(null);
    setEditFormData({
      agreementDuration: "",
      monthlyPayment: "",
      bookingDate: "",
      bookingTime: "",
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditBooking = async () => {
    if (!selectedBooking) return;

    setError(null);
    setSuccess(null);

    try {
      const updatedData = {
        agreementDuration: editFormData.agreementDuration,
        bookingService: selectedBooking.bookingService,
        monthlyPayment: parseFloat(editFormData.monthlyPayment),
        bookingDate: editFormData.bookingDate,
        bookingTime: editFormData.bookingTime,
        status: selectedBooking.status,
      };

      const response = await updateBooking(selectedBooking._id, updatedData);
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === selectedBooking._id ? response.data.updatedBooking : booking
        )
      );
      setSuccess("Booking updated successfully!");
      handleEditClose();
    } catch (err) {
      setError("Failed to update booking");
      console.error(err);
    }
  };

  const handleCancelBooking = async (bookingID) => {
    setError(null);
    setSuccess(null);

    try {
      await deleteBooking(bookingID);
      setBookings((prev) => prev.filter((booking) => booking._id !== bookingID));
      setSuccess("Booking cancelled successfully!");
    } catch (err) {
      setError("Failed to cancel booking");
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      {bookings.length === 0 && !loading && (
        <p className="text-gray-500">No bookings found.</p>
      )}

      <div className="grid gap-6">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="p-4 border rounded-lg shadow-sm flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-bold">
                {booking.providerID?.name || "Unknown Provider"}
              </h3>
              <p className="text-gray-600">
                <strong>Service:</strong> {booking.bookingService}
              </p>
              <p className="text-gray-600">
                <strong>Duration:</strong> {booking.agreementDuration}
              </p>
              <p className="text-gray-600">
                <strong>Monthly Payment:</strong> Rs.{booking.monthlyPayment}
              </p>
              <p className="text-gray-600">
                <strong>Booking Date:</strong> {booking.bookingDate}
              </p>
              <p className="text-gray-600">
                <strong>Booking Time:</strong> {booking.bookingTime}
              </p>
              <p className="text-gray-600">
                <strong>Status:</strong> {booking.status}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => handleEditOpen(booking)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
              >
                Edit
              </button>
              <button
                onClick={() => handleCancelBooking(booking._id)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Booking Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Edit Booking for {selectedBooking?.providerID?.name}
            </h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Agreement Duration
              </label>
              <select
                name="agreementDuration"
                value={editFormData.agreementDuration}
                onChange={handleEditFormChange}
                className="w-full border rounded-md p-2"
              >
                <option value="1 month">1 Month</option>
                <option value="3 months">3 Months</option>
                <option value="6 months">6 Months</option>
                <option value="1 year">1 Year</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Monthly Payment (Rs.)
              </label>
              <input
                type="number"
                name="monthlyPayment"
                value={editFormData.monthlyPayment}
                onChange={handleEditFormChange}
                className="w-full border rounded-md p-2"
                min="1000"
                step="100"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Booking Date
              </label>
              <input
                type="date"
                name="bookingDate"
                value={editFormData.bookingDate}
                onChange={handleEditFormChange}
                className="w-full border rounded-md p-2"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Booking Time
              </label>
              <input
                type="time"
                name="bookingTime"
                value={editFormData.bookingTime}
                onChange={handleEditFormChange}
                className="w-full border rounded-md p-2"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleEditClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleEditBooking}
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition duration-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;