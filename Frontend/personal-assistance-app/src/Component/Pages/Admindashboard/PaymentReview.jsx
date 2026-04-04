import React, { useEffect, useState } from "react";
import Header from "../../UI/AdminDashboard/Common/Header";
import { getAdminPayments, rejectPayment, verifyPayment } from "../../../Lib/api";

const PaymentReview = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayments = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminPayments();
      setPayments(response?.data?.payments || []);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleAction = async (paymentId, action) => {
    setError("");

    try {
      if (action === "verify") {
        await verifyPayment(paymentId);
      } else {
        await rejectPayment(paymentId);
      }
      await loadPayments();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to update payment");
    }
  };

  return (
    <div className="flex-1 relative z-10 ml-[2%]">
      <Header title="Payment Review" />

      <main className="max-w-screen mx-auto py-8 px-0 lg:px-8">
        <div className="rounded-xl overflow-hidden bg-slate-900 bg-opacity-50 z-1 mt-[8px] ml-[10px] p-4">
          {error ? <p className="text-red-300 mb-3">{error}</p> : null}

          {loading ? (
            <p className="text-slate-200">Loading payments...</p>
          ) : (
            <div className="overflow-auto" style={{ maxHeight: "600px" }}>
              <table className="table table-hover table-striped-row table-primary">
                <thead className="sticky top-0">
                  <tr>
                    <th>#</th>
                    <th>Payment</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length > 0 ? (
                    payments.map((payment, index) => (
                      <tr key={payment.paymentID}>
                        <td>{index + 1}</td>
                        <td>
                          <p className="mb-1">ID: {payment.paymentID}</p>
                          <p className="mb-1">Booking: {payment.bookingId}</p>
                          <p className="mb-1">Amount: {payment.amount}</p>
                          <p className="mb-1">Date: {new Date(payment.paymentDate).toLocaleString()}</p>
                        </td>
                        <td>
                          <p className="mb-1">{payment.customerName || "-"}</p>
                          <p className="mb-1">{payment.customerEmail || "-"}</p>
                        </td>
                        <td>{payment.status}</td>
                        <td>
                          {payment.status === "PENDING" ? (
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleAction(payment.paymentID, "verify")}
                              >
                                Verify
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleAction(payment.paymentID, "reject")}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted">No action</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No payments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PaymentReview;
