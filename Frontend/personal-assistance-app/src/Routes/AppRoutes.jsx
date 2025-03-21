import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "../Component/UI/Layout";
import HomePage from "../Component/Pages/HomePage";
import PrivateRoute from "./PrivateRoute";
import PaymentDashboard from "../Component/Pages/PaymentDashboard";
import ServiceCatergoty from "../Component/UI/ServiceCatergoty";

export default function AppRoutes({ isAuthenticated, setIsAuthenticated }) {
  return (
    <Routes>
      {/*set public route*/}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />}></Route>
        {/*<Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated}/>}>login</Route>*/}
        {/*Protected Path*/}
        <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/payment" element={<PaymentDashboard />}>
            <Route path="/MakePayment" element={<ServiceCatergoty />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
