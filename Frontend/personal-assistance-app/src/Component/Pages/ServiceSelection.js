// Frontend/personal-assistance-app/src/Pages/ServiceSelection.js
import React, { useState } from "react";
import useServiceProviders from "../Hooks/CustomHook/useServiceProviders";
import { createBooking } from "../../Lib/api";

const categories = [
  "ChildCare",
  "ElderCare",
  "KitchenHelpers",
  "PetCare",
  "Education",
  "HouseCleaning",
];

// Static user details
const staticUser = {
  id: "static-user-123",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+94 123 456 789",
};

const ServiceSelection = () => {
  const { category, setCategory, serviceProviders, loading, error } =
    useServiceProviders();

  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    agreementDuration: "1 month",
    monthlyPayment: 5000,
    bookingDate: "", // New field for date
    bookingTime: "", // New field for time
  });

  const handleOpenModal = (provider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProvider(null);
    setFormData({
      agreementDuration: "1 month",
      monthlyPayment: 5000,
      bookingDate: "",
      bookingTime: "",
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add this before handleBookNow
const validateForm = () => {
  const errors = {};
  
  // Validate monthly payment
  if (!formData.monthlyPayment) {
    errors.monthlyPayment = "Monthly payment is required";
  } else if (formData.monthlyPayment < 1000) {
    errors.monthlyPayment = "Monthly payment must be at least 1000";
  }
  
  // Validate booking date
  if (!formData.bookingDate) {
    errors.bookingDate = "Booking date is required";
  } else {
    const selectedDate = new Date(formData.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.bookingDate = "Booking date cannot be in the past";
    }
  }
  
  // Validate booking time
  if (!formData.bookingTime) {
    errors.bookingTime = "Booking time is required";
  }
  
  // Set validation errors and return valid status
  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};
const handleBookNow = async () => {
  if (!selectedProvider) return;
  
  // Validate form before submission
  if (!validateForm()) {
    return; // Stop submission if validation fails
  }

  setBookingError(null);
  setBookingSuccess(null);

    try {
      const bookingData = {
        customerID: staticUser.id,
        customerDetails: {
          name: staticUser.name,
          email: staticUser.email,
          phone: staticUser.phone,
        },
        providerID: selectedProvider._id,
        agreementDuration: formData.agreementDuration,
        bookingService: category,
        monthlyPayment: parseFloat(formData.monthlyPayment),
        bookingDate: formData.bookingDate,
        bookingTime: formData.bookingTime,
      };

      const response = await createBooking(bookingData);
      setBookingSuccess("Booking created successfully!");
      console.log(response.data);
      handleCloseModal();
    } catch (err) {
      setBookingError("Failed to create booking");
      console.error(err);
    }
  };
  

  return (
    <div className="container mx-auto p-6">
      {/* Category Tabs */}
      <div className="flex justify-start space-x-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-md font-semibold text-sm transition duration-300 ${
              category === cat
                ? "bg-teal-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-teal-500 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Service Providers List */}
      <div className="p-6">
        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {bookingError && <p className="text-red-500">{bookingError}</p>}
        {bookingSuccess && <p className="text-green-500">{bookingSuccess}</p>}
        {serviceProviders.length === 0 && !loading && (
          <p className="text-gray-500">No service providers found.</p>
        )}
        {serviceProviders.map((provider) => (
          <div
            key={provider._id}
            className="flex items-center p-4 mb-4 border rounded-lg shadow-sm"
          >
            <img
              src={provider.photo}
              alt={provider.name}
              className="w-24 h-24 rounded-full mr-4"
            />
            <div className="flex-1">
              <h3 className="text-lg font-bold">{provider.name}</h3>
              <p className="text-gray-600">{provider.location}</p>
              <p className="text-gray-600">{provider.about}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-800">
                from Rs.{provider.payRate[0]} to Rs.{provider.payRate[1]} per hour
              </p>
              <button
                onClick={() => handleOpenModal(provider)}
                className="bg-teal-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-teal-600 transition duration-300"
              >
                BOOK NOW
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Book {selectedProvider?.name}
            </h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Agreement Duration
              </label>
              <select
                name="agreementDuration"
                value={formData.agreementDuration}
                onChange={handleFormChange}
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
    value={formData.monthlyPayment}
    onChange={handleFormChange}
    className={`w-full border rounded-md p-2 ${
      validationErrors.monthlyPayment ? "border-red-500" : ""
    }`}
    min="1000"
    step="100"
  />
  {validationErrors.monthlyPayment && (
    <p className="text-red-500 text-sm mt-1">{validationErrors.monthlyPayment}</p>
  )}
</div>


<div className="mb-4">
  <label className="block text-gray-700 font-semibold mb-2">
    Booking Date
  </label>
  <input
    type="date"
    name="bookingDate"
    value={formData.bookingDate}
    onChange={handleFormChange}
    className={`w-full border rounded-md p-2 ${
      validationErrors.bookingDate ? "border-red-500" : ""
    }`}
    min={new Date().toISOString().split("T")[0]}
  />
  {validationErrors.bookingDate && (
    <p className="text-red-500 text-sm mt-1">{validationErrors.bookingDate}</p>
  )}
</div>


<div className="mb-4">
  <label className="block text-gray-700 font-semibold mb-2">
    Booking Time
  </label>
  <input
    type="time"
    name="bookingTime"
    value={formData.bookingTime}
    onChange={handleFormChange}
    className={`w-full border rounded-md p-2 ${
      validationErrors.bookingTime ? "border-red-500" : ""
    }`}
  />
  {validationErrors.bookingTime && (
    <p className="text-red-500 text-sm mt-1">{validationErrors.bookingTime}</p>
  )}
</div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Booking For</h3>
              <p className="text-gray-600">
                <strong>Name:</strong> {staticUser.name}
              </p>
              <p className="text-gray-600">
                <strong>Email:</strong> {staticUser.email}
              </p>
              <p className="text-gray-600">
                <strong>Phone:</strong> {staticUser.phone}
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleBookNow}
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition duration-300"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSelection;