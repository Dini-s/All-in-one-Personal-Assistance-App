import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute({ isAuthenticated }) {
  //if user login only can navigate to others
  const token = localStorage.getItem("authToken");
  const canAccess = isAuthenticated || Boolean(token);

  return canAccess ? <Outlet /> : <Navigate to="/login" replace />;
}
