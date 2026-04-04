import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createOfflinePayment } from "../../Lib/api";

const PaymentForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const [formData, setFormData] = useState({
    bookingId: state.bookingid || "",
    amount: state.amount || "",
    transferReference: "",
    payerName: "",
    note: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.bookingId || !formData.amount || !formData.transferReference || !formData.payerName) {
      setError("Please fill in all required fields");
      return;
    }

    const amount = Number(formData.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be a positive number");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createOfflinePayment({
        bookingId: formData.bookingId,
        amount,
        transferReference: formData.transferReference,
        payerName: formData.payerName,
        note: formData.note,
      });

      const paymentId = response?.data?.payment?.paymentID;
      navigate(`/payment/paymentSuccess${paymentId ? `?paymentId=${paymentId}` : ""}`);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to create payment request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Make Payment</h2>
      <p className="mt-2 text-slate-600">Submit your offline transfer details for verification.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="bookingId">
            Booking ID
          </label>
          <input
            id="bookingId"
            name="bookingId"
            value={formData.bookingId}
            onChange={onChange}
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="amount">
            Amount (LKR)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="1"
            value={formData.amount}
            onChange={onChange}
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="transferReference">
            Transfer Reference
          </label>
          <input
            id="transferReference"
            name="transferReference"
            value={formData.transferReference}
            onChange={onChange}
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="payerName">
            Payer Name
          </label>
          <input
            id="payerName"
            name="payerName"
            value={formData.payerName}
            onChange={onChange}
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="note">
            Note (Optional)
          </label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={onChange}
            className="w-full rounded-md border px-3 py-2"
            rows={3}
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Submitting..." : "Submit Payment Request"}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
