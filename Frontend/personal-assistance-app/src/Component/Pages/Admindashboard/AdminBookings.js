// Frontend/personal-assistance-app/src/Component/Pages/Admindashboard/AdminBookings.js
import React, { useState, useEffect } from "react";
import { getAllBookings, updateBooking } from "../../../Lib/api";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch all bookings on component mount
  useEffect(() => {
    const fetchAllBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllBookings();
        setBookings(response.data.bookings || []);
      } catch (err) {
        setError("Failed to fetch bookings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllBookings();
  }, []);

  const handleConfirm = async (bookingID) => {
    setError(null);
    setSuccess(null);

    try {
      const updatedData = { status: "CONFIRMED" };
      const response = await updateBooking(bookingID, updatedData);
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingID ? response.data.updatedBooking : booking
        )
      );
      setSuccess("Booking confirmed successfully!");
    } catch (err) {
      setError("Failed to confirm booking");
      console.error(err);
    }
  };

  const handleReject = async (bookingID) => {
    setError(null);
    setSuccess(null);

    try {
      const updatedData = { status: "REJECTED" };
      const response = await updateBooking(bookingID, updatedData);
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingID ? response.data.updatedBooking : booking
        )
      );
      setSuccess("Booking rejected successfully!");
    } catch (err) {
      setError("Failed to reject booking");
      console.error(err);
    }
  };

  return (
    console.log("Booking data structure:", bookings[0]),
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Bookings</h1>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      {bookings.length === 0 && !loading && (
        <p className="text-gray-500">No bookings found.</p>
      )}

      {bookings.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-left">Provider</th>
                <th className="p-4 text-left">Service</th>
                <th className="p-4 text-left">Duration</th>
                <th className="p-4 text-left">Payment (Rs.)</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Time</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="border-b">
                <td className="p-4">{booking.customerDetails?.name || "Unknown Customer"}</td>
                <td className="p-4">{booking.providerDetails?.name || "Unknown Provider"}</td>
                  <td className="p-4">{booking.bookingService}</td>
                  <td className="p-4">{booking.agreementDuration}</td>
                  <td className="p-4">{booking.monthlyPayment}</td>
                  <td className="p-4">{booking.bookingDate}</td>
                  <td className="p-4">{booking.bookingTime}</td>
                  <td className="p-4">{booking.status}</td>
                  <td className="p-4">
                    {booking.status === "PENDING" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleConfirm(booking._id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleReject(booking._id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;