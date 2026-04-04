import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { cancelPayment } from "../../Lib/api";

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const [message, setMessage] = useState("Payment flow cancelled.");

  const handleCancelPayment = async () => {
    if (!paymentId) {
      setMessage("No payment id was provided.");
      return;
    }

    try {
      await cancelPayment(paymentId);
      setMessage("Payment has been cancelled successfully.");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Unable to cancel payment.");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Payment Cancel</h2>
      <p className="mt-3 text-slate-700">{message}</p>

      {paymentId ? (
        <button
          type="button"
          className="mt-4 rounded bg-slate-900 px-4 py-2 text-sm text-white"
          onClick={handleCancelPayment}
        >
          Confirm Cancel Payment
        </button>
      ) : null}

      <div className="mt-4">
        <Link to="/payment" className="text-sm text-slate-700 underline">
          Back to Payment Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancel;
