import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getPaymentById } from "../../Lib/api";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const [statusText, setStatusText] = useState("Payment request submitted.");

  useEffect(() => {
    const loadPayment = async () => {
      if (!paymentId) {
        return;
      }

      try {
        const response = await getPaymentById(paymentId);
        const status = response?.data?.payment?.status;
        if (status) {
          setStatusText(`Current status: ${status}`);
        }
      } catch (_) {
        setStatusText("Payment was created, but status could not be loaded right now.");
      }
    };

    loadPayment();
  }, [paymentId]);

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Payment Success</h2>
      <p className="mt-3 text-slate-700">{statusText}</p>
      <Link to="/payment/PaymentHistory" className="mt-4 inline-block rounded bg-slate-900 px-4 py-2 text-sm text-white">
        Go to Payment History
      </Link>
    </div>
  );
};

export default PaymentSuccess;
