// Frontend/personal-assistance-app/src/Component/Pages/Admindashboard/AdminDashboard.js
import React from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin/financial"
                className="text-blue-500 hover:underline"
              >
                View Financial Reports
              </Link>
            </li>
            <li>
              <Link
                to="/admin/bookings"
                className="text-blue-500 hover:underline"
              >
                Manage Bookings
              </Link>
            </li>
            {/* Add more quick actions */}
          </ul>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Statistics</h2>
          <p>Admin statistics will appear here</p>
        </div>
      </div>
    </div>
  );
}