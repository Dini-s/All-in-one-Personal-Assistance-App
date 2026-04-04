import asyncHandler from "express-async-handler";
import { prisma } from "../config/prismaConfig.js";
import AdminModel from "../models/Adminisator/AdminModel.js";

const OFFLINE_METHOD = "OFFLINE_TRANSFER";

const ensureAdmin = async (req) => {
  const email = req.user?.email;
  if (!email) {
    return false;
  }

  const admin = await AdminModel.findOne({ email }).select("_id");
  return Boolean(admin);
};

const getAuthenticatedCustomerId = async (req) => {
  const userId = req.user?.id;
  const email = req.user?.email;

  if (userId) {
    const customerById = await prisma.customer.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (customerById) {
      return customerById.id;
    }
  }

  if (!email) {
    return null;
  }

  const customerByEmail = await prisma.customer.findUnique({
    where: { Email: email },
    select: { id: true },
  });

  return customerByEmail?.id || null;
};

const getOrCreateOfflinePaymentMethod = async () => {
  const existing = await prisma.paymentMethod.findFirst({
    where: { PaymentType: OFFLINE_METHOD },
  });

  if (existing) {
    return existing;
  }

  return prisma.paymentMethod.create({
    data: {
      PaymentType: OFFLINE_METHOD,
      Description: "Manual offline transfer",
    },
  });
};

const createOfflinePayment = asyncHandler(async (req, res) => {
  const customerId = await getAuthenticatedCustomerId(req);
  if (!customerId) {
    return res.status(403).json({ message: "Customer account not found" });
  }

  const { bookingId, amount, transferReference, payerName, note } = req.body;

  if (!bookingId || !transferReference || !payerName) {
    return res.status(400).json({ message: "bookingId, transferReference and payerName are required" });
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number" });
  }

  const booking = await prisma.booking.findUnique({
    where: { BookingID: bookingId },
    select: {
      BookingID: true,
      CustomerID: true,
    },
  });

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.CustomerID !== customerId) {
    return res.status(403).json({ message: "You cannot pay for this booking" });
  }

  const paymentMethod = await getOrCreateOfflinePaymentMethod();

  const payment = await prisma.payment.create({
    data: {
      Amount: numericAmount,
      Status: "PENDING",
      paymentMethod: {
        connect: {
          MethodId: paymentMethod.MethodId,
        },
      },
      booking: {
        connect: {
          BookingID: bookingId,
        },
      },
    },
    include: {
      paymentMethod: true,
    },
  });

  return res.status(201).json({
    message: "Offline payment request created",
    payment: {
      paymentID: payment.paymentID,
      bookingId,
      amount: payment.Amount,
      status: payment.Status,
      paymentMethod: payment.paymentMethod?.PaymentType,
      transferReference,
      payerName,
      note: note || "",
      createdAt: payment.PaymentDate,
    },
  });
});

const listPaymentHistory = asyncHandler(async (req, res) => {
  const customerId = await getAuthenticatedCustomerId(req);
  if (!customerId) {
    return res.status(403).json({ message: "Customer account not found" });
  }

  const { startDate, endDate, status } = req.query;
  const dateFilter = {};
  if (startDate) {
    dateFilter.gte = new Date(startDate);
  }
  if (endDate) {
    dateFilter.lte = new Date(endDate);
  }

  const payments = await prisma.payment.findMany({
    where: {
      booking: {
        CustomerID: customerId,
      },
      Status: status || undefined,
      PaymentDate: Object.keys(dateFilter).length ? dateFilter : undefined,
    },
    include: {
      booking: true,
      paymentMethod: true,
    },
    orderBy: {
      PaymentDate: "desc",
    },
  });

  return res.json({
    payments: payments.map((payment) => ({
      paymentID: payment.paymentID,
      bookingId: payment.BookingId,
      amount: payment.Amount,
      status: payment.Status,
      paymentDate: payment.PaymentDate,
      paymentMethod: payment.paymentMethod?.PaymentType || OFFLINE_METHOD,
      agreementDuration: payment.booking?.AgreementDuration || "",
    })),
  });
});

const getPaymentById = asyncHandler(async (req, res) => {
  const customerId = await getAuthenticatedCustomerId(req);
  if (!customerId) {
    return res.status(403).json({ message: "Customer account not found" });
  }

  const { id } = req.params;
  const payment = await prisma.payment.findUnique({
    where: { paymentID: id },
    include: {
      booking: true,
      paymentMethod: true,
    },
  });

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  if (payment.booking?.CustomerID !== customerId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return res.json({
    payment: {
      paymentID: payment.paymentID,
      bookingId: payment.BookingId,
      amount: payment.Amount,
      status: payment.Status,
      paymentDate: payment.PaymentDate,
      paymentMethod: payment.paymentMethod?.PaymentType || OFFLINE_METHOD,
    },
  });
});

const cancelPayment = asyncHandler(async (req, res) => {
  const customerId = await getAuthenticatedCustomerId(req);
  if (!customerId) {
    return res.status(403).json({ message: "Customer account not found" });
  }

  const { id } = req.params;
  const payment = await prisma.payment.findUnique({
    where: { paymentID: id },
    include: { booking: true },
  });

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  if (payment.booking?.CustomerID !== customerId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (payment.Status !== "PENDING") {
    return res.status(400).json({ message: "Only pending payments can be cancelled" });
  }

  const updated = await prisma.payment.update({
    where: { paymentID: id },
    data: { Status: "CANCELLED" },
  });

  return res.json({
    message: "Payment cancelled",
    payment: {
      paymentID: updated.paymentID,
      status: updated.Status,
    },
  });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const isAdmin = await ensureAdmin(req);
  if (!isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }

  const { id } = req.params;

  const payment = await prisma.payment.findUnique({
    where: { paymentID: id },
  });

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  if (payment.Status !== "PENDING") {
    return res.status(400).json({ message: "Only pending payments can be verified" });
  }

  const updated = await prisma.payment.update({
    where: { paymentID: id },
    data: { Status: "COMPLETED" },
  });

  return res.json({
    message: "Payment verified",
    payment: {
      paymentID: updated.paymentID,
      status: updated.Status,
    },
  });
});

const rejectPayment = asyncHandler(async (req, res) => {
  const isAdmin = await ensureAdmin(req);
  if (!isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }

  const { id } = req.params;

  const payment = await prisma.payment.findUnique({
    where: { paymentID: id },
  });

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  if (payment.Status !== "PENDING") {
    return res.status(400).json({ message: "Only pending payments can be rejected" });
  }

  const updated = await prisma.payment.update({
    where: { paymentID: id },
    data: { Status: "CANCELLED" },
  });

  return res.json({
    message: "Payment rejected",
    payment: {
      paymentID: updated.paymentID,
      status: updated.Status,
    },
  });
});

const requestRefund = asyncHandler(async (req, res) => {
  const customerId = await getAuthenticatedCustomerId(req);
  if (!customerId) {
    return res.status(403).json({ message: "Customer account not found" });
  }

  const { paymentId, reason } = req.body;
  if (!paymentId || !reason) {
    return res.status(400).json({ message: "paymentId and reason are required" });
  }

  const payment = await prisma.payment.findUnique({
    where: { paymentID: paymentId },
    include: { booking: true },
  });

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  if (payment.booking?.CustomerID !== customerId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (payment.Status !== "COMPLETED") {
    return res.status(400).json({ message: "Only completed payments are eligible for refund" });
  }

  const existingRefund = await prisma.refundRequests.findUnique({
    where: { paymentId: paymentId },
  });

  if (existingRefund) {
    return res.status(400).json({ message: "Refund request already exists" });
  }

  const refund = await prisma.refundRequests.create({
    data: {
      customerID: customerId,
      paymentId,
      amount: payment.Amount,
      reason,
      status: "PENDING",
    },
  });

  return res.status(201).json({
    message: "Refund request submitted",
    refund,
  });
});

const listRefundHistory = asyncHandler(async (req, res) => {
  const customerId = await getAuthenticatedCustomerId(req);
  if (!customerId) {
    return res.status(403).json({ message: "Customer account not found" });
  }

  const refunds = await prisma.refundRequests.findMany({
    where: {
      customerID: customerId,
    },
    include: {
      payment: true,
    },
    orderBy: {
      requestAt: "desc",
    },
  });

  return res.json({
    refunds: refunds.map((refund) => ({
      refundId: refund.refundId,
      paymentId: refund.paymentId,
      amount: refund.amount,
      reason: refund.reason,
      status: refund.status,
      requestAt: refund.requestAt,
      paymentStatus: refund.payment?.Status,
    })),
  });
});

const listAllRefunds = asyncHandler(async (req, res) => {
  const isAdmin = await ensureAdmin(req);
  if (!isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }

  const refunds = await prisma.refundRequests.findMany({
    include: {
      payment: true,
      customer: true,
    },
    orderBy: {
      requestAt: "desc",
    },
  });

  return res.json({
    refunds: refunds.map((refund) => ({
      refundId: refund.refundId,
      paymentId: refund.paymentId,
      amount: refund.amount,
      reason: refund.reason,
      status: refund.status,
      requestAt: refund.requestAt,
      customerEmail: refund.customer?.Email || "",
      paymentStatus: refund.payment?.Status,
    })),
  });
});

const listAllPayments = asyncHandler(async (req, res) => {
  const isAdmin = await ensureAdmin(req);
  if (!isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }

  const payments = await prisma.payment.findMany({
    include: {
      booking: {
        include: {
          customer: true,
        },
      },
      paymentMethod: true,
    },
    orderBy: {
      PaymentDate: "desc",
    },
  });

  return res.json({
    payments: payments.map((payment) => ({
      paymentID: payment.paymentID,
      bookingId: payment.BookingId,
      amount: payment.Amount,
      status: payment.Status,
      paymentDate: payment.PaymentDate,
      paymentMethod: payment.paymentMethod?.PaymentType || OFFLINE_METHOD,
      customerEmail: payment.booking?.customer?.Email || "",
      customerName: `${payment.booking?.customer?.FirstName || ""} ${payment.booking?.customer?.LastName || ""}`.trim(),
    })),
  });
});

const approveRefund = asyncHandler(async (req, res) => {
  const isAdmin = await ensureAdmin(req);
  if (!isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }

  const { id } = req.params;
  const existing = await prisma.refundRequests.findUnique({
    where: { refundId: id },
  });

  if (!existing) {
    return res.status(404).json({ message: "Refund request not found" });
  }

  if (existing.status !== "PENDING") {
    return res.status(400).json({ message: "Only pending refunds can be approved" });
  }

  const [refund] = await prisma.$transaction([
    prisma.refundRequests.update({
      where: { refundId: id },
      data: { status: "APPROVED" },
    }),
    prisma.payment.update({
      where: { paymentID: existing.paymentId },
      data: { Status: "REFUNDED" },
    }),
  ]);

  return res.json({ message: "Refund approved", refund });
});

const rejectRefund = asyncHandler(async (req, res) => {
  const isAdmin = await ensureAdmin(req);
  if (!isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }

  const { id } = req.params;
  const existing = await prisma.refundRequests.findUnique({
    where: { refundId: id },
  });

  if (!existing) {
    return res.status(404).json({ message: "Refund request not found" });
  }

  if (existing.status !== "PENDING") {
    return res.status(400).json({ message: "Only pending refunds can be rejected" });
  }

  const refund = await prisma.refundRequests.update({
    where: { refundId: id },
    data: { status: "CANCELLED" },
  });

  return res.json({ message: "Refund rejected", refund });
});

export {
  approveRefund,
  cancelPayment,
  createOfflinePayment,
  getPaymentById,
  listAllPayments,
  listAllRefunds,
  listPaymentHistory,
  listRefundHistory,
  rejectRefund,
  rejectPayment,
  requestRefund,
  verifyPayment,
};
