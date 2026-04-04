import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute({ isAuthenticated }) {
  //if user login only can navigate to others
  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
}
