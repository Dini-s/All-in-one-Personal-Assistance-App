import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute({ isAuthenticated, isAdmin }) {
  console.log("AdminRoute -> isAuthenticated:", isAuthenticated);
  console.log("AdminRoute -> isAdmin:", isAdmin);

  if (!isAuthenticated) {
    return <Navigate to="/admin-signin" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
