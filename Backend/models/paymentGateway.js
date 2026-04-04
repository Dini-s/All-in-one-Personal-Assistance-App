// controllers/paymentController.js
import dotenv from 'dotenv';

dotenv.config();

// PayHere Sandbox API Endpoint
const PAYHERE_CHECKOUT_URL = 'https://sandbox.payhere.lk/pay/checkout';

const initPayment = async (req, res) => {
    const { amount, order_id, items } = req.body;

    const numericAmount = Number(amount);
    if (!order_id || !items || !Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: 'Invalid payment payload' });
    }

    if (!process.env.PAYHERE_MERCHANT_ID || !process.env.PAYHERE_RETURN_URL || !process.env.PAYHERE_CANCEL_URL || !process.env.PAYHERE_NOTIFY_URL) {
        return res.status(500).json({ error: 'PayHere is not configured' });
    }

    const paymentData = {
        merchant_id: process.env.PAYHERE_MERCHANT_ID,
        return_url: process.env.PAYHERE_RETURN_URL,
        cancel_url: process.env.PAYHERE_CANCEL_URL,
        notify_url: process.env.PAYHERE_NOTIFY_URL,
        order_id: order_id,
        items: items,
        currency: 'LKR',
        amount: numericAmount.toFixed(2),

    };

    try {
        const checkoutUrl = `${PAYHERE_CHECKOUT_URL}?${new URLSearchParams(paymentData).toString()}`;
        res.json({ checkout_url: checkoutUrl, session: { url: checkoutUrl } });
    } catch (error) {
        res.status(500).json({ error: 'Payment initialization failed' });
    }
};

export { initPayment };