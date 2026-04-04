import React, { useState, useEffect } from "react";
import { BarChart2, ShoppingBag, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Header from "../../UI/AdminDashboard/Common/Header";
import StatCard from "../../UI/AdminDashboard/Common/StatCard";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { approveAdminRefund, getAdminRefunds, rejectAdminRefund } from "../../../Lib/api";

export default function RefundPage() {
  const [refunnds, setRefund] = useState([]);
  const [isLoadind, setIsLoading] = useState(true);
  const [stats, setStat] = useState({
    total: 0,
    requested: 0,
    approved: 0,
    cancelled: 0,
  });

  useEffect(() => {
    refundDetail();
  }, []);

  const refundDetail = async () => {
    try {
      const detail = await getAdminRefunds();
      setRefund(detail.data.refunds);
      calculateStats(detail.data.refunds);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching refunds:", error);
      setIsLoading(false);
    }
  };

  const calculateStats = (refundData) => {
    const total = refundData.length;
    const approved = refundData.filter(
      (ref) => ref.status === "APPROVED",
    ).length;
    const requested = refundData.filter(
      (ref) => ref.status === "PENDING",
    ).length;
    const cancel = refundData.filter(
      (ref) => ref.status === "CANCELLED",
    ).length;

    setStat({
      total,
      requested,
      approved,
      cancelled: cancel,
    });
  };

  const handleApprove = async (refundId) => {
    try {
      await approveAdminRefund(refundId);
      refundDetail();
      alert("Refund Approved Successfully!");
    } catch (error) {
      console.error("Error approving refund:", error);
      alert("Failed to approve refund");
    }
  };

  const handleReject = async (refundId) => {
    try {
      await rejectAdminRefund(refundId);
      refundDetail();
      alert("Refund Rejected Successfully!");
    } catch (error) {
      console.error("Error rejecting refund:", error);
      alert("Failed to reject refund");
    }
  };
  return (
    <div className="flex-1 relative z-10  ml-[2%] ">
      <Header title="Refund Handling" />
      <main className="max-w-screen mx-auto py-8 px-0 lg:px-8 ">
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-9 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name="Total Refunds"
            icon={Zap}
            value={stats.total}
            color="#6366F1"
          />
          <StatCard
            name="Requested Refunds"
            icon={BarChart2}
            value={stats.requested}
            color="#8B5CF6"
          />
          <StatCard
            name=" Approved Refunds"
            icon={BarChart2}
            value={stats.approved}
            color="#10B981"
          />
          <StatCard
            name="Cancelled Refunds"
            icon={BarChart2}
            value={stats.cancelled}
            color="#EC4899"
          />
          <div
            className="overflow-auto w-[1088px]"
            style={{ maxHeight: "500px" }}
          >
            <table className="table  table-hover table-striped-row backdrop-opacity-10  table-primary">
              <thead className="sticky top-0 ">
                <tr>
                  <th scope="col" className="text-indigo">
                    #
                  </th>
                  <th scope="col">Refund Details</th>
                  <th scope="col">Refund Reason</th>
                  <th scope="col">Refund Status</th>
                  <th scope="col">Refund Action</th>
                </tr>
              </thead>
              {
                <tbody className="table-group-divider">
                  {refunnds.length > 0 ? (
                    refunnds.map((pay, index) => (
                      <tr key={pay.refundId}>
                        <th scope="row" className="text-left px-2 py-2">
                          {index + 1}
                        </th>
                        <td className="text-left px-2 py-2 w-[20px]">
                          <p className="whitespace-nowrap">
                            Refund ID: {pay.refundId}
                          </p>
                          <p className="whitespace-nowrap">
                            Refund Date:
                            {new Date(pay.requestAt).toLocaleDateString()}
                          </p>
                          <p className="whitespace-nowrap">
                            <p>Refund Amount: {pay.amount}</p>
                          </p>
                        </td>
                        <td className="text-left px-2 py-2 min-w-[20px] whitespace-nowrap">
                          {pay.reason}
                        </td>
                        <td className="text-left px-2 py-2 min-w-[20px] whitespace-nowrap">
                          {pay.status}
                        </td>
                        <td className="text-center px-2 py-2 min-w-[20px]">
                          {pay.status === "PENDING" && (
                            <div className="d-flex gap-2 justify-content-center">
                              <button
                                onClick={() => handleApprove(pay.refundId)}
                                className="btn btn-sm btn-success"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(pay.refundId)}
                                className="btn btn-sm btn-danger"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">
                        No payments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              }
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
