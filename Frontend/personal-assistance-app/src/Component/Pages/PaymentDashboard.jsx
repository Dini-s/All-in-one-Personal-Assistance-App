import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import SideNavBar from "../UI/SideNavBar";

const PaymentDashboard = () => {
  const location = useLocation();
  const isRoot = location.pathname === "/payment";

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-xl border bg-white p-4">
          <SideNavBar />
        </aside>

        <main className="rounded-xl border bg-white p-6">
          {isRoot ? (
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Payments</h1>
              <p className="mt-2 text-slate-600">
                Use offline transfer for monthly payments, then track your payment and refund status.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Link
                  to="/payment/PaymentOption"
                  className="rounded-lg border p-4 text-slate-800 hover:bg-slate-50"
                >
                  <p className="font-medium">Start Payment</p>
                  <p className="text-sm text-slate-600">Create a new offline payment request</p>
                </Link>

                <Link
                  to="/payment/PaymentHistory"
                  className="rounded-lg border p-4 text-slate-800 hover:bg-slate-50"
                >
                  <p className="font-medium">Payment History</p>
                  <p className="text-sm text-slate-600">See your payment statuses</p>
                </Link>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default PaymentDashboard;
