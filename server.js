const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const hotelCategoryRoutes = require("./routes/hotelCategoryRoutes"); // Import slider routes
const roomRoutes = require("./routes/roomRoutes"); // Import slider routes
const hotelRoutes = require("./routes/hotelRoutes"); // Import hotel routes
const bookingRoutes = require("./routes/bookingRoutes"); // Import booking routes
const webBookingRoutes = require("./routes/webBookingRoutes"); // Import webBookingRoutes routes
const dailySummaryRoutes = require("./routes/dailySummary"); // Import booking routes
const expenseRoutes = require("./routes/expenses");
const webHotelRoutes = require("./routes/webHotelRoutes");
const webHotelDetailsRoutes = require("./routes/webHotelDetailsRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const roomNumbersRoutes = require("./routes/roomNumbers"); // Import the new room numbers routes
require("dotenv").config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Auth Routes
app.use("/api/auth", authRoutes);

// Slider Routes
app.use("/api", hotelCategoryRoutes); // Add slider routes under /api

// Room Routes
app.use("/api", roomRoutes); // Add slider routes under /api

// Portfolio Routes
app.use("/api", hotelRoutes); // Add slider routes under /api

//Booking Routes
app.use("/api", bookingRoutes);
//Booking Routes
app.use("/api", dailySummaryRoutes);
//Web Booking Routes
app.use("/api", webBookingRoutes);
//Expense Routes
app.use("/api/expenses", expenseRoutes);

app.use("/api/web-hotels", webHotelRoutes);
app.use("/api/web-hotel-details", webHotelDetailsRoutes);

// Payment Routes
app.use("/api/payment", paymentRoutes);

// Room Numbers Routes - Add the new routes
app.use("/api/room-numbers", roomNumbersRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
