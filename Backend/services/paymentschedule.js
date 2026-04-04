import cron from 'node-cron'
import { prisma } from '../config/prismaConfig.js'


export function schedulePaymentComplete() {

    cron.schedule('0 * * * *', async () => {
        try {
            const timeoutHours = Number(process.env.PAYMENT_PENDING_TIMEOUT_HOURS || 24);
            const stalePendingCutoff = new Date(Date.now() - timeoutHours * 60 * 60 * 1000);

            const completionPayment = await prisma.payment.findMany({
                where: {
                    Status: "PENDING",
                    PaymentDate: {
                        lte: stalePendingCutoff
                    }
                },
                include: {
                    booking: {
                        include: {
                            customer: true
                        }
                    }
                }


            });

            for (const payment of completionPayment) {

                await prisma.payment.update({
                    where: {
                        paymentID: payment.paymentID
                    },
                    data: {
                        Status: "CANCELLED"
                    }
                });

            }



            if (completionPayment.length > 0) {
                console.log(`Marked ${completionPayment.length} stale pending payments as CANCELLED`);
            }
        } catch (error) {
            console.error('Error in payment scheduler:', error)
        }
    });

}