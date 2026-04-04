import express from 'express';
import { initPayment } from '../models/paymentGateway.js'
import { handlePaymentNotification } from '../models/handlePaymentNotification.js';



const router = express.Router();

router.post('/init-payment', initPayment);
router.post('/payment-notify', handlePaymentNotification);



export { router as PaymentGatewayRoute }