// Backend/server.js (Relevant parts)
import express from "express";
import mongoose from "mongoose";
// import bodyParser from "body-parser"; // bodyParser is built into express >= 4.16
import cors from "cors";
import dotenv from "dotenv";

// --- Import Your Routes ---
import { paymentRoute } from "./routes/paymentRouts.js";
import { financialActivityRoute } from "./routes/financialActivity.js";
import { bookingRouter } from "./routes/bookingRoutes.js";
import ServiceProviderRouter from './routes/serviceProviderRoute.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatBotRoutes from './routes/chatBotRoutes.js'; // <<< Ensure this points to the correct file
import spRoutes from './routes/spRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

// --- Import Your Middleware & Services ---
import validateToken from "./middlwares/validateTokenHandler.js";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 8070;
const URL = process.env.MONGO_URL;

// --- Middleware Setup ---
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Adjust as needed
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
    console.log(`[Server Log] Received: ${req.method} ${req.originalUrl}`);
    next();
  });

// Use built-in Express parsers (bodyParser is generally not needed separately)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- Database Connection ---
mongoose.connect(URL)
    .then(() => console.log("MongoDb Connected Successfully"))
    .catch((err) => console.log("Connection Failed", err));

mongoose.connection.on("error", err => {
    console.log("MongoDB connection error:", err);
});
mongoose.connection.once("open", () => {
    console.log("MongoDB connection successful");
});

// --- Route Definitions ---
app.use('/api/auth', authRoutes);
app.use('/api/user', validateToken, userRoutes);
app.use('/api/service-provider', validateToken, spRoutes);
app.use("/api/payment", validateToken, paymentRoute);
app.use("/adminDashBoard/Financial", financialActivityRoute);
app.use("/home/booking", bookingRouter);
app.use("/home/serviceProvider", ServiceProviderRouter);
app.use("/admin", adminRoutes);
app.use('/api/chat', chatBotRoutes); // <<< Correctly mounted
app.use('/api/admin', validateToken, reviewRoutes);

// --- Start Server & Scheduled Tasks ---
app.listen(PORT, () => {
    console.log(`Server start and running on port ${PORT}`);
});

// --- Basic Root Route ---
app.get('/', (req, res) => {
    res.send('SeraniLux Backend is Running!');
});

// --- Global Error Handler (Optional but Recommended) ---
app.use((err, req, res, next) => {
    console.error("Global Error Handler Caught:", err.stack);
    res.status(500).json({ message: 'Something broke!', error: err.message });
});