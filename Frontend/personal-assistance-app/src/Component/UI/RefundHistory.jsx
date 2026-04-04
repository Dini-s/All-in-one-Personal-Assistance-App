import React, { useEffect, useState } from "react";
import { getRefundHistory } from "../../Lib/api";

const RefundHistory = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRefunds = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getRefundHistory();
        setRefunds(response?.data?.refunds || []);
      } catch (apiError) {
        setError(apiError?.response?.data?.message || "Failed to load refund history");
      } finally {
        setLoading(false);
      }
    };

    loadRefunds();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Refund History</h2>
      <p className="mt-2 text-slate-600">View all your refund requests and current statuses.</p>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <p className="mt-5 text-slate-600">Loading refunds...</p>
      ) : refunds.length === 0 ? (
        <p className="mt-5 text-slate-600">No refund requests found.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-collapse border text-sm">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="border px-3 py-2">Refund ID</th>
                <th className="border px-3 py-2">Payment ID</th>
                <th className="border px-3 py-2">Amount</th>
                <th className="border px-3 py-2">Status</th>
                <th className="border px-3 py-2">Reason</th>
                <th className="border px-3 py-2">Requested At</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((refund) => (
                <tr key={refund.refundId}>
                  <td className="border px-3 py-2">{refund.refundId}</td>
                  <td className="border px-3 py-2">{refund.paymentId}</td>
                  <td className="border px-3 py-2">{refund.amount}</td>
                  <td className="border px-3 py-2">{refund.status}</td>
                  <td className="border px-3 py-2">{refund.reason}</td>
                  <td className="border px-3 py-2">{new Date(refund.requestAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RefundHistory;
