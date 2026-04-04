
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const mapGatewayStatus = (statusCode) => {
    if (statusCode === '2') {
        return 'COMPLETED';
    }
    if (statusCode === '-1' || statusCode === '-2' || statusCode === '-3') {
        return 'CANCELLED';
    }
    return 'PENDING';
};

const isValidPayHereSignature = ({ merchantId, orderId, amount, currency, statusCode, receivedSignature }) => {
    const merchantSecret = process.env.PAYHERE_SECRET_KEY;
    if (!merchantSecret || !receivedSignature || !merchantId || !orderId || !amount || !currency || !statusCode) {
        return false;
    }

    const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const localSignature = crypto
        .createHash('md5')
        .update(`${merchantId}${orderId}${amount}${currency}${statusCode}${secretHash}`)
        .digest('hex')
        .toUpperCase();

    return localSignature === String(receivedSignature).toUpperCase();
};

export const handlePaymentNotification = async (req, res) => {
    // Extract payment details from the webhook payload
    const {
        merchant_id,
        order_id, // Unique identifier for the payment (e.g., booking ID)
        payment_id, // Payment gateway's transaction ID
        payhere_amount, // Amount paid
        payhere_currency, // Currency (e.g., LKR)
        status_code, // Payment status code (e.g., '2' for success)
        md5sig,
        card_holder_name, // Cardholder's name
        card_no, // Masked card number
        customer_email, // Customer's email
    } = req.body;

    const hasValidSignature = isValidPayHereSignature({
        merchantId: merchant_id,
        orderId: order_id,
        amount: payhere_amount,
        currency: payhere_currency,
        statusCode: status_code,
        receivedSignature: md5sig,
    });

    if (!hasValidSignature) {
        return res.status(401).json({ error: 'Invalid PayHere signature' });
    }

    try {
        // Find the latest pending payment for this booking and amount.
        const targetAmount = Number(payhere_amount);

        const payment = await prisma.payment.findFirst({
            where: {
                BookingId: order_id,
                Amount: Number.isFinite(targetAmount) ? targetAmount : undefined,
            },
            orderBy: {
                PaymentDate: 'desc',
            },
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        const finalStatuses = new Set(['COMPLETED', 'CANCELLED', 'REFUNDED']);
        if (finalStatuses.has(payment.Status)) {
            // Idempotent success response for duplicate notifications.
            return res.status(200).json({ message: 'Notification already processed' });
        }

        const nextStatus = mapGatewayStatus(status_code);
        if (payment.Status === nextStatus) {
            return res.status(200).json({ message: 'No state change required' });
        }

        const updatedPayment = await prisma.payment.update({
            where: { paymentID: payment.paymentID },
            data: {
                Status: nextStatus,
            },
        });

        console.log('Payment status updated:', updatedPayment);
        res.status(200).end(); // Respond to PayHere
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ error: 'Failed to update payment status' });
    }

}  
