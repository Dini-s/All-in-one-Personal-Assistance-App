import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import ProtectedRoute from "./Routes/ProtectedRoute";
import AdminProtectedRoute from "./Routes/AdminProtectedRoute";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import Login from "./Component/Pages/Login";
import Signup from "./Component/Pages/Signup";
import AdminLogin from "./Component/Pages/AdminLogin";
import Dashboard from "./Component/Pages/Dashboard";
import CreateAccount from "./Component/Pages/ServiceProvider/CreateSProviderAccount";
import ServiceSelection from "./Component/Pages/ServiceSelection";
import Profile from "./Component/Pages/Profile";
import BookmarkPage from "./Component/Pages/Bookmarks";
import ServiceProviderDashboard from "./Component/Pages/ServiceProvider/ServiceProviderDashboard";
import MyBookings from "./Component/Pages/MyBookings";
import Chatbot from './Component/Chatbot/Chatbot';
import MyReviews from "./Component/Pages/MyReviews";
import PaymentDashboard from "./Component/Pages/PaymentDashboard";
import PaymentMethod from "./Component/UI/PaymentMethod";
import PaymentForm from "./Component/UI/PaymentForm";
import PaymentHistory from "./Component/UI/PaymentHistory";
import RefundHistory from "./Component/UI/RefundHistory";
import PaymentSuccess from "./Component/UI/PaymenSuccess";
import PaymentCancel from "./Component/UI/PaymentCancel";


import ServiceSelection1 from "./Component/Pages/ServiceProvider/ServiceSelection";
import HouseCleaningService from "./Component/Pages/ServiceProvider/HouseCleaningService";
import KitchenServiceSelection from "./Component/Pages/ServiceProvider/KitchenServiceSelection";
import ElderCareService from "./Component/Pages/ServiceProvider/ElderCareServiceSelection";
import PetCareService from "./Component/Pages/ServiceProvider/PetCareServiceSelection";
import ChildCareService from "./Component/Pages/ServiceProvider/ChildCareServiceSelection";
import EducationService from "./Component/Pages/ServiceProvider/EducationServiceSelection";
import ClaudeChatbot from "./Component/Pages/ClaudeChatbot";

//import admin routes
import AdminLayout from "./Component/UI/AdminDashboard/AdminLayout";
import Overview from "./Component/Pages/Admindashboard/Overview";
import Users from "./Component/Pages/Admindashboard/Users";
import Transactions from "./Component/Pages/Admindashboard/Transactions";
import ProviderPage from "./Component/Pages/Admindashboard/ProviderPage";
import ProfitLoss from "./Component/Pages/Admindashboard/ProfitLoss";
import SalaryCalculation from "./Component/Pages/Admindashboard/SalaryCalculation";
import RefundPage from "./Component/Pages/Admindashboard/RefundPage";
import Settings from "./Component/Pages/Admindashboard/Settings";
import AdminBookings from "./Component/Pages/Admindashboard/AdminBookings";
import Services from "./Component/Pages/Admindashboard/ServicePage";
import AdminReviews from "./Component/Pages/Admindashboard/AdminReviews"; // Added import
import PaymentReview from "./Component/Pages/Admindashboard/PaymentReview";


function AuthRedirector() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);

        if (decodedToken.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("authToken");
          setIsAuthenticated(false);
        }
      } catch (error) {
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
      }
    }

    setLoading(false);
  }, []);

  if (loading) return null; // Or a loading spinner

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/signin" replace />
  );
}

const ProtectedLayout = () => (
  <ProtectedRoute>
    <Outlet />
  </ProtectedRoute>
);
const ProtectedLayout2 = () => (
  <AdminProtectedRoute>
    <Outlet />
  </AdminProtectedRoute>
);

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<AuthRedirector />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/createaccount" element={<CreateAccount />} />
        <Route path="/serviceselections" element={<ServiceSelection1 />} />
        <Route path="/housecselection" element={<HouseCleaningService />} />
      

        <Route
          path="/kitchensselection"
          element={<KitchenServiceSelection />}
        />
        <Route path="/eldercselection" element={<ElderCareService />} />
        <Route path="/petcaresselection" element={<PetCareService />} />
        <Route path="/childcaresselection" element={<ChildCareService />} />
        <Route path="/educationsselection" element={<EducationService />} />
        <Route path="/chat-bot" element={<ClaudeChatbot />} />

        {/* Protected routes grouped under ProtectedLayout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/spdashboard" element={<ServiceProviderDashboard />} />
          <Route path="/serviceselection" element={<ServiceSelection />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/my-reviews" element={<MyReviews />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/bookmarks" element={<BookmarkPage />} />
          <Route path="/payment" element={<PaymentDashboard />}>
            <Route path="MakePayment" element={<PaymentForm />} />
            <Route path="PaymentOption" element={<PaymentMethod />} />
            <Route path="PaymentHistory" element={<PaymentHistory />} />
            <Route path="RefundHistory" element={<RefundHistory />} />
            <Route path="paymentSuccess" element={<PaymentSuccess />} />
            <Route path="paymentCancel" element={<PaymentCancel />} />
          </Route>
        </Route>

        {/* admin */}
        <Route path="/admin-signin" element={<AdminLogin />} />

        <Route element={<ProtectedLayout2 />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Overview />} />
            <Route path="user" element={<Users />} />
            <Route path="servicePage" element={<Services />} />
            <Route path="transaction" element={<Transactions />} />
            <Route path="payment-review" element={<PaymentReview />} />
            <Route path="provider" element={<ProviderPage />} />
            <Route path="profitLoss" element={<ProfitLoss />} />
            <Route path="salary" element={<SalaryCalculation />} />
            <Route path="refund" element={<RefundPage />} />
            <Route path="setting" element={<Settings />} />
            <Route path="bookings" element={<AdminBookings />} />{" "}
            <Route path="reviews" element={<AdminReviews />} /> {/* Added Reviews route */}
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Login />} />
      </Routes>
      <Chatbot />
    </Router>
  );
}

export default App;
