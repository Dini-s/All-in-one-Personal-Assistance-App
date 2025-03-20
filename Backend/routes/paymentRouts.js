import express from 'express'
import { createPayment, retrievAllPayments, filterPaymentHistory } from '../models/payment.js';

const router = express.Router();

//create path to make paymet
router.post("/makePayment", (req, res, next) => {
    console.log("MakePayment route accessed");
    next();
}, createPayment)

//retriev all payments
router.get("/paymentHistory", retrievAllPayments);

//retriev date filteed Payments
router.get("/filteredHistory", filterPaymentHistory);

export { router as paymentRoute }

