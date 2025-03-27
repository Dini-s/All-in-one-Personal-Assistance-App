// Frontend/personal-assistance-app/src/Component/Pages/Admindashboard/AdminBookings.js
import React, { useState, useEffect } from "react";
import { getAllBookings, updateBooking } from "../../../Lib/api";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from 'jspdf-autotable';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Company information
  const companyInfo = {
    name: "SereniLux",
    address: "123 Business Street, City, Country",
    phone: "+1 234 567 890",
    email: "info@SereniLux.com"
  };

  // Fetch all bookings on component mount
  useEffect(() => {
    const fetchAllBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllBookings();
        setBookings(response.data.bookings || []);
        setFilteredBookings(response.data.bookings || []);
      } catch (err) {
        setError("Failed to fetch bookings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllBookings();
  }, []);

  // Filter bookings based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter(booking => {
        return (
          (booking.customerDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.providerDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.bookingService?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.bookingDate?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
      setFilteredBookings(filtered);
    }
  }, [searchTerm, bookings]);

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

  const generatePDF = () => {
    const doc = new jsPDF();
    
       // Add company information
       doc.setFontSize(16);
       doc.setTextColor(40);
       doc.text(companyInfo.name, 105, 15, { align: 'center' });
       
       doc.setFontSize(10);
       doc.text(companyInfo.address, 105, 22, { align: 'center' });
       doc.text(`Phone: ${companyInfo.phone} | Email: ${companyInfo.email}`, 105, 28, { align: 'center' });
       
       // Add title and date
       doc.setFontSize(14);
       doc.text("Bookings Report", 105, 38, { align: 'center' });
       
       const date = new Date().toLocaleString();
       doc.setFontSize(10);
       doc.text(`Generated on: ${date}`, 105, 44, { align: 'center' });
       
       // Prepare data for the table
       const headers = [
         ['Customer', 'Provider', 'Service', 'Duration', 'Payment (Rs.)', 'Date', 'Time', 'Status']
       ];
       
       const tableData = filteredBookings.map(booking => [
         booking.customerDetails?.name || "N/A",
         booking.providerDetails?.name || "N/A",
         booking.bookingService || "N/A",
         booking.agreementDuration || "N/A",
         booking.monthlyPayment || "N/A",
         booking.bookingDate || "N/A",
         booking.bookingTime || "N/A",
         booking.status || "N/A"
       ]);
       
       // Add table using autoTable
       autoTable(doc, {
         head: headers,
         body: tableData,
         startY: 50,
         theme: 'grid',
         headStyles: {
           fillColor: [41, 128, 185],
           textColor: 255,
           fontStyle: 'bold'
         },
         alternateRowStyles: {
           fillColor: [245, 245, 245]
         },
         margin: { top: 50 }
       });
       
       // Save the PDF
       doc.save(`bookings_report_${new Date().toISOString().slice(0, 10)}.pdf`);
     };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Bookings</h1>

      {/* Search and PDF buttons */}
      <div className="flex justify-between mb-6">
        <div className="w-1/3">
          <input
            type="text"
            placeholder="Search bookings..."
            className="w-full p-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={generatePDF}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
        >
          Generate PDF Report
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      {filteredBookings.length === 0 && !loading && (
        <p className="text-gray-500">No bookings found.</p>
      )}

      {filteredBookings.length > 0 && (
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
              {filteredBookings.map((booking) => (
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