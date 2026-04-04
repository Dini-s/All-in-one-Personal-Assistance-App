import React from "react";
import { Link } from "react-router-dom";

function SideNavBar() {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Payment Menu</h2>
      <nav className="flex flex-col gap-2 text-sm">
        <Link to="/payment" className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
          Dashboard
        </Link>
        <Link to="/payment/PaymentOption" className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
          Payment Option
        </Link>
        <Link to="/payment/MakePayment" className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
          Make Payment
        </Link>
        <Link to="/payment/PaymentHistory" className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
          Payment History
        </Link>
        <Link to="/payment/RefundHistory" className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
          Refund History
        </Link>
      </nav>
    </div>
  );
}

export default SideNavBar;
