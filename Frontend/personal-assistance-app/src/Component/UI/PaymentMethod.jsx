import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentMethod = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingid, amount } = location.state || {};

  const startOfflinePayment = () => {
    navigate("/payment/MakePayment", {
      state: {
        bookingid: bookingid || "",
        amount: amount || "",
        method: "OFFLINE_TRANSFER",
      },
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Payment Option</h2>
      <p className="mt-2 text-slate-600">For now, payments are handled via manual offline transfer.</p>

      <div className="mt-5 rounded-lg border p-4">
        <p className="font-medium text-slate-900">Offline Transfer</p>
        <p className="mt-1 text-sm text-slate-600">Submit your transfer reference and payer details.</p>
        <button
          type="button"
          className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
          onClick={startOfflinePayment}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default PaymentMethod;
