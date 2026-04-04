import asyncHandler from "express-async-handler"
import { prisma } from "../config/prismaConfig.js"
import { ObjectId } from "mongodb";
import { salaryMail } from "../services/salaryMail.js";

const PAYHERE_CHECKOUT_URL = "https://sandbox.payhere.lk/pay/checkout";

const buildPayHereCheckoutUrl = ({ orderId, amount, items }) => {
    const paymentData = {
        merchant_id: process.env.PAYHERE_MERCHANT_ID,
        return_url: process.env.PAYHERE_RETURN_URL,
        cancel_url: process.env.PAYHERE_CANCEL_URL,
        notify_url: process.env.PAYHERE_NOTIFY_URL,
        order_id: orderId,
        items,
        currency: "LKR",
        amount: amount.toFixed(2),
    };

    return `${PAYHERE_CHECKOUT_URL}?${new URLSearchParams(paymentData).toString()}`;
};

//create paymente
const createPayment = asyncHandler(async (req, res) => {
    console.log("Create Payment");
    let { Amount, PaymentMethod, BookingId, Item } = req.body;

    if (!Amount || !PaymentMethod || !BookingId) {
        res.status(400);
        throw new Error("Missing Required fields");
    }

    if (String(PaymentMethod).toLowerCase() !== "payhere") {
        return res.status(400).json({ error: "Only PayHere is supported for MVP" });
    }

    const numericAmount = Number(Amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: "Invalid payment amount" });
    }

    if (!process.env.PAYHERE_MERCHANT_ID || !process.env.PAYHERE_RETURN_URL || !process.env.PAYHERE_CANCEL_URL || !process.env.PAYHERE_NOTIFY_URL) {
        return res.status(500).json({ error: "PayHere is not configured" });
    }

    try {
        //find reletated paymentMethod detials
        let paymentMethod = await prisma.paymentMethod.findFirst({
            where: { PaymentType: PaymentMethod },
        });

        if (!paymentMethod) {
            paymentMethod = await prisma.paymentMethod.create({
                data: {
                    PaymentType: PaymentMethod,
                    Description: "new Payment Method"
                },
            });
        }

        //check Booking ID
        const bookingExists = await prisma.booking.findUnique({
            where: { BookingID: BookingId }
        });
        if (!bookingExists) {
            res.status(400);
            throw new Error("Invalid Booking ID");
        }

        const itemName = Item || "Monthly Service Payment";
        const checkoutUrl = buildPayHereCheckoutUrl({
            orderId: BookingId,
            amount: numericAmount,
            items: itemName,
        });


        //create payment
        await prisma.payment.create({

            data: {
                Amount: numericAmount,
                paymentMethod: {
                    connect: {
                        MethodId: paymentMethod.MethodId
                    },
                },
                booking: {
                    connect: {
                        BookingID: BookingId
                    },
                }
            }


        });
        res.status(200).json({
            message: "Payment initialized",
            checkout_url: checkoutUrl,
            session: { url: checkoutUrl },
        });

    } catch (error) {
        console.error('Error initializing payment:', error);
        res.status(500).json({ error: 'Payment initialization failed' });
    }

})

//retriew all payments
const retrievAllPayments = asyncHandler(async (req, res) => {
    try {
        const allPayment = await prisma.payment.findMany({
            orderBy: {
                PaymentDate: "desc"
            },
            include: {
                paymentMethod: true,
                booking: {
                    include: {
                        //add customer and booking details related to the booking
                        customer: true,
                        serviceProvider: true,

                    }
                }
            }
        });
        //Map payment with details
        const paymentDetails = allPayment.map(payment => ({
            ...payment,
            paymentMethodName: payment.paymentMethod.PaymentType,
            bookingDetails: {
                bookingID: payment.booking.BookingID,
                agreemetnDuration: payment.booking.AgreementDuration,
                monthlyPayment: payment.booking.MonthlyPayment,
                bookingDate: payment.booking.BookingDate,
                customerName: payment.booking.customer ?
                    `${payment.booking.customer.FirstName}${payment.booking.customer.LastName}`
                    : "unknown",
                providerName: payment.booking.serviceProvider ?
                    `${payment.booking.serviceProvider.FirstName}${payment.booking.serviceProvider.LastName}` :
                    "unknown Provider"


            }
        }))

        res.send({ payment: paymentDetails });
    } catch (error) {
        console.error("Error retrieving payment:", error);
        res.status(500).json({ message: "Error Retrieving payment", error: error.message })
    }


});


//payment details filter from given time range
const filterPaymentHistory = asyncHandler(async (req, res) => {
    try {
        //get user entered stard &end date
        const { startDate, endDate } = req.query;

        //create object to store filtered date
        let dateFilter = {};
        if (startDate) {
            //filter date after or on start date
            dateFilter.gte = new Date(startDate);
        }
        if (endDate) {
            //filter date before or on end date
            dateFilter.lte = new Date(endDate);
        }

        //for testing
        console.log("Date Filter:", dateFilter);

        const allfilteredPAyment = await prisma.payment.findMany({
            where: {
                PaymentDate: Object.keys(dateFilter).length > 0 ? dateFilter : undefined
            },
            orderBy: {
                PaymentDate: "desc"
            },
            include: {
                paymentMethod: true,
                booking: {
                    include: {
                        //add customer and booking details related to the booking
                        customer: true,
                        serviceProvider: true,

                    }
                }
            }

        });
        //Map payment with details
        const paymentDetails = allfilteredPAyment.map(payment => ({
            ...payment,
            paymentMethodName: payment.paymentMethod.PaymentType,
            bookingDetails: {
                bookingID: payment.booking.BookingID,
                agreemetnDuration: payment.booking.AgreementDuration,
                monthlyPayment: payment.booking.MonthlyPayment,
                bookingDate: payment.booking.BookingDate,
                customerName: payment.booking.customer ?
                    `${payment.booking.customer.FirstName}${payment.booking.customer.LastName}`
                    : "unknown",
                providerName: payment.booking.serviceProvider ?
                    `${payment.booking.serviceProvider.FirstName}${payment.booking.serviceProvider.LastName}` :
                    "unknown Provider"


            }
        }))

        //res.send({ payment: paymentDetails });
        res.json(paymentDetails);
    } catch (error) {
        console.error("Error retrieving payment:", error);
        res.status(500).json({ message: "Error Retrieving payment", error: error.message })
    }
})

//retriev service Category
const retriveServiceCategory = asyncHandler(async (req, res) => {

    const getCategory = await prisma.category.findMany();
    res.json(getCategory);
})

//retrieve bookindDetails
const retrieveBookingDetails = asyncHandler(async (req, res) => {
    const { providerId, customerId } = req.params;
    const bookingDetails = await prisma.booking.findFirst({
        where: {
            CustomerID: customerId,
            Provider: providerId,
        }
    })
    if (!bookingDetails) {
        return res.status(404).json({ message: "Booking details not found" });
    }
    res.status(200).json(bookingDetails);
})

//retrive ServiceProvider
const retrieveSelectedProvider = asyncHandler(async (req, res) => {

    const { categoryID } = req.params;
    console.log("Category ID:", categoryID);

    try {
        const getServiceIDS = await prisma.service.findMany({
            where: {
                Category: new ObjectId(categoryID),
            },
            select: {
                ServiceID: true,
            }

        })
        console.log("Service IDs found:", getServiceIDS);

        const serviceIDS = getServiceIDS.map((services) => services.ServiceID);

        const getProviderName = await prisma.serviceProvider.findMany({
            where: {
                ServiceType: {
                    in: serviceIDS
                }
            }

        });
        res.json(getProviderName);
    } catch (error) {
        console.error("Error retrieving service providers:", error);
        res.status(500).json({ message: "Error retrieving service providers", error: error.message });
    }


})




//set provider salary
const makeProviderSalary = asyncHandler(async (req, res) => {
    try {

        const nowd = new Date();
        const currentMonth = nowd.getMonth(); // 0 = January
        const currentYear = nowd.getFullYear();


        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);


        //retirev payments.
        const completePayments = await prisma.payment.findMany({
            where: {
                Status: "COMPLETED",
                PaymentDate: {
                    gte: startOfMonth,
                    lt: endOfMonth,
                }
            },
            include: {
                booking: {
                    include: {
                        serviceProvider: {
                            include: {
                                service: {  // Include service to get commission rate
                                    select: { CommisionRate: true }
                                }
                            }
                        }
                    }
                }
            }
        });


        //retirev EPF ETF rate
        const rate = await prisma.deductionRate.findMany();
        console.log(rate)
        const epfAmpount = rate.find(r => r.type === "EPF")?.rate || 0;
        const etfAmount = rate.find(r => r.type === "ETF")?.rate || 0;
        console.log(epfAmpount);



        //group paymnet by provider
        const providerSalaries = {};

        completePayments.forEach(payment => {
            const providerId = payment.booking.serviceProvider.ProviderID;
            const amount = payment.Amount;
            const commissionRate = payment.booking?.serviceProvider?.service?.CommisionRate;
            const finalCommissionRate = commissionRate !== undefined ? (commissionRate / 100) : 0.1; // Dividing by 100 if stored as percentage



            if (!providerSalaries[providerId]) {
                providerSalaries[providerId] = {
                    totalEarning: 0,
                    commissionRate: finalCommissionRate,
                    epfDeduct: 0,
                    etfDeduct: 0,
                    netSalary: 0,
                };
            }
            providerSalaries[providerId].totalEarning += amount;



        });

        //calculate net salary
        for (const providerId in providerSalaries) {
            const totalEarning = providerSalaries[providerId].totalEarning;
            const commisionRate = providerSalaries[providerId].commissionRate;
            console.log(commisionRate);
            const commission = totalEarning * commisionRate;
            const epf = ((totalEarning - commission) * epfAmpount);
            const etf = ((totalEarning - commission) * etfAmount);
            const netSalary = totalEarning - commission - epf - etf;

            //update salary
            providerSalaries[providerId].commission = commission;
            providerSalaries[providerId].EPF = epf;
            providerSalaries[providerId].ETF = etf;
            providerSalaries[providerId].netSalary = netSalary;

            //update system revenue
            await prisma.revenue.create({
                data: {
                    Description: `Commission from provide ${providerId}`,
                    Amount: commission,
                }
            })

            //update provider salary 
            await prisma.providerSalary.upsert({
                where: {
                    provider_month_year: {
                        provider: providerId,
                        month: currentMonth,
                        year: currentYear
                    }
                },
                update: {
                    EPF: { increment: epf },
                    ETF: { increment: etf },
                    totSalary: { increment: netSalary },
                }, create: {
                    provider: providerId,
                    month: currentMonth,
                    year: currentYear,
                    EPF: epf,
                    ETF: etf,
                    totSalary: netSalary,
                },
            });
            //
            const provider = await prisma.serviceProvider.findUnique({
                where: {
                    ProviderID: providerId
                },
            });
            /* const pdfBytes = await generatePaySheetPDF(provider, providerSalaries[providerId]);
             //send pdf to provider's mail*/
            await salaryMail(provider.email, providerSalaries[providerId])

        }
        res.json({
            message: "Provider salaries calculated and updated successfully",
            providerSalaries,
        });
    } catch (error) {
        console.error("Error calculating provider salaries:", error);
        res.status(500).json({
            message: "Error calculating provider salaries",
            error: error.message,
        });
    }
})
export { createPayment, retrievAllPayments, filterPaymentHistory, retriveServiceCategory, retrieveSelectedProvider, makeProviderSalary, retrieveBookingDetails };
