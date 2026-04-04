import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../UI/NavBar";
import api from "../../Lib/api";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

// Custom SVG Icons with Gradient Styling
const BookingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 transition-transform hover:scale-110" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="bookingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#6B46C1", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#4C51BF", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path fill="url(#bookingGrad)" stroke="url(#bookingGrad)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ServiceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 transition-transform hover:scale-110" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="serviceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#38B2AC", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#2D3748", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path fill="url(#serviceGrad)" stroke="url(#serviceGrad)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const TaskIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 transition-transform hover:scale-110" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="taskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#D69E2E", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#B7791F", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path fill="url(#taskGrad)" stroke="url(#taskGrad)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const RatingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 transition-transform hover:scale-110" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="ratingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#E53E3E", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#C53030", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path fill="url(#ratingGrad)" stroke="url(#ratingGrad)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const EarningsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 transition-transform hover:scale-110" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="earningsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#48BB78", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#2F855A", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path fill="url(#earningsGrad)" stroke="url(#earningsGrad)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AvailabilityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 transition-transform hover:scale-110" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="availabilityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#9F7AEA", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#6B46C1", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path fill="url(#availabilityGrad)" stroke="url(#availabilityGrad)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const MyBookingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 transition-transform hover:scale-110" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="myBookingsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#6B46C1", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#4C51BF", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path fill="url(#myBookingsGrad)" stroke="url(#myBookingsGrad)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const CompletedServicesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 transition-transform hover:scale-110" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="completedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#38B2AC", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#2D3748", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path fill="url(#completedGrad)" stroke="url(#completedGrad)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PendingServicesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 transition-transform hover:scale-110" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="pendingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#D69E2E", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#B7791F", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path fill="url(#pendingGrad)" stroke="url(#pendingGrad)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Stat Card Component
const StatCard = ({ title, value, icon, onClick, buttonText = null }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    const duration = 1000;
    const stepTime = Math.abs(Math.floor(duration / end));
    const timer = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      if (start === end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      className="relative bg-white/90 backdrop-blur-md border border-gray-200/50 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 flex flex-col items-center cursor-pointer group"
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      aria-label={`${title} Card`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
      <div className="relative z-10">
        {icon}
        <h4 className="text-lg font-semibold text-gray-900 tracking-tight">{title}</h4>
        <p className="text-4xl font-extrabold text-indigo-600 my-4">
          {title === "Earnings" ? `$${displayValue}` : displayValue}
          {title === "Rating" && <span className="text-base text-gray-600 ml-1">/ 5</span>}
          {title === "Availability" && <span className="text-base text-gray-600 ml-1 capitalize">{value.toLowerCase()}</span>}
        </p>
        {buttonText && (
          <motion.button 
            className="mt-6 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-medium text-base py-3 px-6 rounded-xl transition-all duration-300 shadow-md"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`${buttonText} Button`}
          >
            {buttonText}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// Activity Item Component
const ActivityItem = ({ title, time, status, statusColor }) => (
  <motion.li 
    className="p-6 border-b border-gray-200/50 hover:bg-gray-100/50 transition-all duration-300 backdrop-blur-sm"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.4 }}
  >
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className={`h-4 w-4 rounded-full bg-${statusColor}-500 shadow-lg`}></div>
        <div>
          <p className="text-base font-medium text-gray-900 tracking-tight">{title}</p>
          <span className={`inline-block px-3 py-1 text-sm rounded-full text-white bg-${statusColor}-500 mt-1 font-medium`}>
            {status}
          </span>
        </div>
      </div>
      <span className="text-sm text-gray-600">{time}</span>
    </div>
  </motion.li>
);

// Service Card Component for Carousel
const ServiceCard = ({ name, image, onClick }) => (
  <motion.div 
    className="relative bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group"
    whileHover={{ scale: 1.05, y: -5 }}
    onClick={onClick}
    aria-label={`${name} Service Card`}
  >
    <div className="relative">
      <img src={image} alt={name} className="h-64 w-full object-cover rounded-t-3xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent rounded-t-3xl"></div>
      <div className="absolute bottom-6 left-6">
        <h4 className="text-xl font-semibold text-white tracking-tight">{name}</h4>
        <p className="text-base text-gray-200">Professional {name.toLowerCase()} services</p>
      </div>
    </div>
    <div className="p-6">
      <button className="text-indigo-500 hover:text-indigo-600 font-medium text-base flex items-center transition-colors duration-300">
        Browse Providers
        <svg className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </motion.div>
);

const toUserCacheSnapshot = (user = {}) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  profile_pic: user.profile_pic || null,
  isServiceProvider: Boolean(user.isServiceProvider),
});

const cacheUserDataSafely = (user = {}) => {
  try {
    localStorage.setItem("userData", JSON.stringify(toUserCacheSnapshot(user)));
  } catch (error) {
    if (error?.name === "QuotaExceededError") {
      try {
        localStorage.removeItem("userData");
        localStorage.setItem("userData", JSON.stringify({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          isServiceProvider: Boolean(user.isServiceProvider),
        }));
      } catch (_) {
        console.warn("Skipping userData cache due to storage quota limits");
      }
      return;
    }
    console.warn("Failed to cache userData:", error);
  }
};

const HomePage = () => {
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    bookings: 0,
    services: 0,
    pendingTasks: 0,
    rating: 0,
    earnings: 0,
    completedServices: 0,
  });
  const [activities, setActivities] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setIsLoading(false); // Allow non-logged-in view
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await api.get("/api/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const counts = await api.get("/api/user/counts", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData(response.data);
        cacheUserDataSafely(response.data);
        
        setStats({
          bookings: counts.data.myBookings || 0,
          services: counts.data.completedBookings || 0,
          pendingTasks: counts.data.pendingBookings || 1,
          rating: 4.8,
          earnings: response.data.earnings || 0,
          completedServices: counts.data.completedBookings || 0,
        });
        
        if (response.data.isServiceProvider) {
          setActivities([
            { id: 1, title: "New Service Request - Cleaning", time: "2 hours ago", status: "New", statusColor: "purple" },
            { id: 2, title: "Payment Received - $120", time: "Yesterday", status: "Completed", statusColor: "teal" },
            { id: 3, title: "Client Review - 5 Stars", time: "2 days ago", status: "Review", statusColor: "pink" },
            { id: 4, title: "Booking Confirmed - Home Tutor", time: "3 days ago", status: "Confirmed", statusColor: "amber" },
          ]);
        } else {
          setActivities([
            { id: 1, title: "Booked Cleaning Service", time: "1 day ago", status: "Confirmed", statusColor: "teal" },
            { id: 2, title: "Payment for Elder Care Service", time: "3 days ago", status: "Paid", statusColor: "indigo" },
            { id: 3, title: "Left Review for Tutoring", time: "1 week ago", status: "Completed", statusColor: "emerald" },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem("authToken");
          navigate("/signin");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    navigate("/");
  };

  const handleSignIn = () => navigate("/signin");
  const handleSignUp = () => navigate("/signup");
  const handleViewBookings = () => navigate("/my-bookings");
  const handleManageAvailability = () => navigate("/manage-availability");
  const handleViewServices = () => navigate("/services");
  const handleNextSlide = () => setCurrentSlide((prev) => (prev + 1) % 4);
  const handlePrevSlide = () => setCurrentSlide((prev) => (prev - 1 + 4) % 4);

  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex justify-center items-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/30 to-teal-100/30 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-gradient-to-r from-purple-500 to-indigo-500"></div>
          <p className="mt-4 text-lg text-gray-900">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen text-gray-900 font-sans relative overflow-hidden"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/30 to-teal-100/30 backdrop-blur-sm"></div>
      
      <div className="relative z-10">
        <NavBar handleLogout={handleLogout} user={userData} forceUpdate={() => {}} />

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-20 pl-64">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">Welcome to Our Service Platform</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">Discover top-notch services or manage your offerings with ease. Join our community today!</p>
            {!userData.firstName && (
              <div className="space-x-4">
                <motion.button
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-medium py-3 px-8 rounded-xl shadow-md transition-all duration-300"
                  whileHover={{ scale: 1.1, y: -5, boxShadow: "0 0 20px rgba(20, 184, 166, 0.4)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSignIn}
                  aria-label="Sign In Button"
                >
                  Sign In
                </motion.button>
                <motion.button
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium py-3 px-8 rounded-xl shadow-md transition-all duration-300"
                  whileHover={{ scale: 1.1, y: -5, boxShadow: "0 0 20px rgba(107, 70, 193, 0.4)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSignUp}
                  aria-label="Sign Up Button"
                >
                  Sign Up
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Welcome Section with Profile and Search */}
          <motion.div
            className="relative bg-white/90 backdrop-blur-md border border-gray-200/50 p-8 rounded-3xl shadow-lg mb-12 flex flex-col md:flex-row md:items-center md:justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-3xl"></div>
            <div className="relative flex items-center space-x-6 z-10">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
                  Welcome back, {userData.firstName || "Guest"}!
                </h2>
                <p className="text-lg text-gray-600 mt-2 tracking-wide">
                  {userData.isServiceProvider 
                    ? "Manage your services with ease"
                    : "Discover services tailored for you"}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <input
                  type="text"
                  placeholder="Search services..."
                  className="w-full md:w-64 p-3 rounded-xl border border-gray-200/50 bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                  onKeyPress={(e) => e.key === "Enter" && navigate(`/search?q=${e.target.value}`)}
                  aria-label="Search Services"
                />
              </div>
            </div>
            {userData.firstName && (
              <motion.button
                className="mt-6 md:mt-0 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-medium text-base py-3 px-8 rounded-xl shadow-md transition-all duration-300 z-10"
                whileHover={{ scale: 1.1, y: -5, boxShadow: "0 0 20px rgba(20, 184, 166, 0.4)" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate("/profile")}
                aria-label="View Profile Button"
              >
                View Profile
              </motion.button>
            )}
          </motion.div>

          {/* Overview Widget */}
          <motion.div
            className="bg-white/90 backdrop-blur-md border border-gray-200/50 p-8 rounded-3xl shadow-lg mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">Booking Overview</h3>
              <p className="text-lg text-gray-600 mt-1 tracking-wide">Your key metrics at a glance</p>
            </div>
            <div className="flex flex-wrap gap-6 mt-6 sm:mt-0">
              <span className="flex items-center text-indigo-600 font-medium text-base">
                <BookingIcon className="h-6 w-6 mr-3" /> Bookings: {stats.bookings}
              </span>
              <span className="flex items-center text-teal-600 font-medium text-base">
                <ServiceIcon className="h-6 w-6 mr-3" /> Services: {stats.services}
              </span>
              <span className="flex items-center text-amber-600 font-medium text-base">
                <TaskIcon className="h-6 w-6 mr-3" /> Pending: {stats.pendingTasks}
              </span>
            </div>
          </motion.div>

          {/* Stats Section */}
          {userData.isServiceProvider && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <StatCard 
                title="Bookings" 
                value={stats.bookings} 
                icon={<BookingIcon />}
                onClick={handleViewBookings}
                buttonText="View All"
              />
              <StatCard 
                title="Active Services" 
                value={stats.services} 
                icon={<ServiceIcon />}
                onClick={handleViewServices}
                buttonText="Manage Services"
              />
              <StatCard 
                title="Pending Tasks" 
                value={stats.pendingTasks} 
                icon={<TaskIcon />}
                onClick={() => navigate("/pending-tasks")}
              />
              <StatCard 
                title="Rating" 
                value={stats.rating.toFixed(1)} 
                icon={<RatingIcon />}
                onClick={() => navigate("/reviews")}
              />
              <StatCard 
                title="Earnings" 
                value={stats.earnings} 
                icon={<EarningsIcon />}
                onClick={() => navigate("/earnings")}
              />
              <StatCard 
                title="Availability" 
                value={userData.availability === "yes" ? "Active" : "Inactive"} 
                icon={<AvailabilityIcon />}
                onClick={handleManageAvailability}
                buttonText="Manage"
              />
            </motion.div>
          )}

          {/* Recent Activities Section */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">Recent Activities</h3>
              <motion.button
                className="text-indigo-600 hover:text-indigo-700 font-medium text-base flex items-center transition-colors duration-300"
                whileHover={{ scale: 1.1, y: -5 }}
                onClick={() => navigate("/activities")}
                aria-label="View All Activities"
              >
                View All
                <svg className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-3xl shadow-lg overflow-hidden">
              <AnimatePresence>
                {activities.length > 0 ? (
                  activities.slice(0, 3).map(activity => (
                    <ActivityItem
                      key={activity.id}
                      title={activity.title}
                      time={activity.time}
                      status={activity.status}
                      statusColor={activity.statusColor}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-600">
                    No recent activities to display
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Service Provider Quick Actions */}
          {userData.isServiceProvider && (
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.button
                  onClick={() => navigate("/profile")}
                  className="bg-white/90 backdrop-blur-md border border-gray-200/50 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-4"
                  whileHover={{ scale: 1.05, y: -5, boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Update Profile Button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-lg text-gray-900 font-medium tracking-tight">Update Profile</span>
                </motion.button>
                <motion.button
                  onClick={handleManageAvailability}
                  className="bg-white/90 backdrop-blur-md border border-gray-200/50 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-4"
                  whileHover={{ scale: 1.05, y: -5, boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Update Availability Button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-lg text-gray-900 font-medium tracking-tight">Update Availability</span>
                </motion.button>
                <motion.button
                  onClick={() => navigate("/earnings")}
                  className="bg-white/90 backdrop-blur-md border border-gray-200/50 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-4"
                  whileHover={{ scale: 1.05, y: -5, boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="View Earnings Button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-lg text-gray-900 font-medium tracking-tight">View Earnings</span>
                </motion.button>
                <motion.button
                  onClick={() => navigate("/feedback")}
                  className="bg-white/90 backdrop-blur-md border border-gray-200/50 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-4"
                  whileHover={{ scale: 1.05, y: -5, boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="View Feedback Button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span className="text-lg text-gray-900 font-medium tracking-tight">View Feedback</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Regular User Features - Carousel */}
          {!userData.isServiceProvider && (
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Popular Services</h3>
              <div className="relative">
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                  animate={{ x: `-${currentSlide * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  {[
                    { 
                      name: "House Cleaning", 
                      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8Y2xlYW5pbmd8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=80",
                      onClick: () => navigate("/services/cleaning")
                    },
                    { 
                      name: "Elder Care", 
                      image: "https://images.unsplash.com/photo-1601758003122-53c40e686a19?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTR8fGNhcmVnaXZlciUyMGFzc2lzdGluZyUyMGVsZGVybHklMjB3b21hbnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=80",
                      onClick: () => navigate("/services/plumbing")
                    },
                    { 
                      name: "Tutoring", 
                      image: "https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHR1dG9yaW5nfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                      onClick: () => navigate("/services/tutoring")
                    },
                    { 
                      name: "Pet Care", 
                      image: "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cGV0JTIwY2FyZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=80",
                      onClick: () => navigate("/services/electrical")
                    },
                  ].map((service, index) => (
                    <div key={index} className="w-full">
                      <ServiceCard name={service.name} image={service.image} onClick={service.onClick} />
                    </div>
                  ))}
                </motion.div>
                <motion.button
                  onClick={handlePrevSlide}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-md p-4 rounded-full shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.1, y: -5, boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Previous Slide"
                >
                  <ChevronLeftIcon />
                </motion.button>
                <motion.button
                  onClick={handleNextSlide}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-md p-4 rounded-full shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.1, y: -5, boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Next Slide"
                >
                  <ChevronRightIcon />
                </motion.button>
              </div>
              <div className="text-center mt-8">
                <motion.button
                  onClick={() => navigate("/services")}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-medium py-3 px-10 rounded-xl shadow-md transition-all duration-300"
                  whileHover={{ scale: 1.1, y: -5, boxShadow: "0 0 20px rgba(20, 184, 166, 0.4)" }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="View All Services Button"
                >
                  View All Services
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Modern Footer */}
        <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-gray-300 py-16 mt-12">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              {/* Branding Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h3 className="text-2xl font-bold text-white tracking-tight mb-4">SereniLux</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                  Connecting you with trusted service providers for a seamless experience. Your satisfaction, our priority.
                </p>
              </motion.div>

              {/* Services Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h4 className="text-lg font-semibold text-white tracking-tight mb-4">Services</h4>
                <ul className="space-y-3">
                  {["House Cleaning", "Elder Care", "Tutoring", "Pet Care"].map((service, index) => (
                    <motion.li key={index} whileHover={{ x: 5, color: "#2dd4bf" }} transition={{ duration: 0.3 }}>
                      <a
                        href={`/services/${service.toLowerCase().replace(" ", "-")}`}
                        className="text-gray-400 hover:text-teal-400 transition-colors duration-300"
                      >
                        {service}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Quick Links Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h4 className="text-lg font-semibold text-white tracking-tight mb-4">Quick Links</h4>
                <ul className="space-y-3">
                  {["About Us", "Privacy Policy", "Terms of Service"].map((link, index) => (
                    <motion.li key={index} whileHover={{ x: 5, color: "#2dd4bf" }} transition={{ duration: 0.3 }}>
                      <a
                        href={`/${link.toLowerCase().replace(" ", "-")}`}
                        className="text-gray-400 hover:text-teal-400 transition-colors duration-300"
                      >
                        {link}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Contact Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <h4 className="text-lg font-semibold text-white tracking-tight mb-4">Get in Touch</h4>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <li>Email: <a href="mailto:support@serenilux.com" className="hover:text-teal-400 transition-colors duration-300">support@serenilux.com</a></li>
                  <li>Phone: <a href="tel:+18005551234" className="hover:text-teal-400 transition-colors duration-300">+1-800-555-1234</a></li>
                  <li className="pt-2">
                    <div className="flex space-x-4">
                      {[
                        { href: "https://facebook.com", icon: <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/> },
                        { href: "https://twitter.com", icon: <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-2.717 0-4.92 2.203-4.92 4.917 0 .386.045.762.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.733-.674 1.585-.674 2.492 0 1.714.873 3.231 2.201 4.119-.812-.026-1.576-.249-2.247-.616v.062c0 2.375 1.688 4.357 3.923 4.81-.411.112-.845.171-1.293.171-.314 0-.619-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.396 0-.788-.023-1.175-.068 2.187 1.405 4.771 2.223 7.548 2.223 9.056 0 14.01-7.503 14.01-14.012 0-.211-.005-.422-.014-.632.962-.695 1.8-1.562 2.457-2.549z"/> },
                        { href: "https://linkedin.com", icon: <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-9.019-7.243-11.018-3.869v-2"/> },
                      ].map((social, index) => (
                        <motion.a
                          key={index}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-teal-400 transition-colors duration-300"
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            {social.icon}
                          </svg>
                        </motion.a>
                      ))}
                    </div>
                  </li>
                </ul>
              </motion.div>
            </div>

            {/* Divider and Copyright */}
            <motion.div
              className="border-t border-gray-700 pt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <p className="text-gray-500 text-sm">
                © 2025 SereniLux. All rights reserved.
              </p>
            </motion.div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;