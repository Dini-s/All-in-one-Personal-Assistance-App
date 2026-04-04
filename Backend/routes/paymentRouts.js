import express from "express";
import {
    approveRefund,
    cancelPayment,
    createOfflinePayment,
    getPaymentById,
    listAllRefunds,
    listPaymentHistory,
    listRefundHistory,
    rejectRefund,
    rejectPayment,
    requestRefund,
    verifyPayment,
} from "../controllers/simplePaymentController.js";

const router = express.Router();

router.post("/make-payment", createOfflinePayment);
router.get("/history", listPaymentHistory);
router.get("/refund-history", listRefundHistory);
router.post("/refund-request", requestRefund);
router.get("/admin/refunds", listAllRefunds);
router.patch("/admin/refunds/:id/approve", approveRefund);
router.patch("/admin/refunds/:id/reject", rejectRefund);
router.get("/:id", getPaymentById);
router.patch("/:id/cancel", cancelPayment);
router.patch("/:id/verify", verifyPayment);
router.patch("/:id/reject", rejectPayment);

export { router as paymentRoute };


