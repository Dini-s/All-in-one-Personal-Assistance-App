import React, { useEffect, useState } from "react";
import { getPaymentHistory, requestRefund } from "../../Lib/api";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [reasonByPayment, setReasonByPayment] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getPaymentHistory();
      setPayments(response?.data?.payments || []);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const onReasonChange = (paymentId, value) => {
    setReasonByPayment((prev) => ({ ...prev, [paymentId]: value }));
  };

  const submitRefund = async (paymentId) => {
    const reason = reasonByPayment[paymentId] || "";
    if (!reason.trim()) {
      setError("Please enter a refund reason before submitting");
      return;
    }

    setError("");

    try {
      await requestRefund({ paymentId, reason });
      await loadPayments();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Refund request failed");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Payment History</h2>
      <p className="mt-2 text-slate-600">Track your payment requests and submit refund requests when eligible.</p>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <p className="mt-5 text-slate-600">Loading payments...</p>
      ) : payments.length === 0 ? (
        <p className="mt-5 text-slate-600">No payments found.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-collapse border text-sm">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="border px-3 py-2">Payment ID</th>
                <th className="border px-3 py-2">Booking</th>
                <th className="border px-3 py-2">Amount</th>
                <th className="border px-3 py-2">Status</th>
                <th className="border px-3 py-2">Date</th>
                <th className="border px-3 py-2">Refund</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.paymentID}>
                  <td className="border px-3 py-2">{payment.paymentID}</td>
                  <td className="border px-3 py-2">{payment.bookingId}</td>
                  <td className="border px-3 py-2">{payment.amount}</td>
                  <td className="border px-3 py-2">{payment.status}</td>
                  <td className="border px-3 py-2">{new Date(payment.paymentDate).toLocaleString()}</td>
                  <td className="border px-3 py-2">
                    <input
                      type="text"
                      placeholder="Reason"
                      value={reasonByPayment[payment.paymentID] || ""}
                      onChange={(event) => onReasonChange(payment.paymentID, event.target.value)}
                      className="mb-2 w-full rounded border px-2 py-1"
                    />
                    <button
                      type="button"
                      className="rounded bg-slate-900 px-3 py-1 text-white disabled:opacity-50"
                      disabled={payment.status !== "COMPLETED"}
                      onClick={() => submitRefund(payment.paymentID)}
                    >
                      Request Refund
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
