const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const BookingController = require("../controllers/webBookingController");

// @desc Create a new booking
// @route POST /api/web/booking
router.post("/web/booking", protect, BookingController.createBooking);

// @desc Get all bookings
// @route GET /api/web/bookings
router.get("/web/bookings", protect, BookingController.getBookings);

// @desc Get a single booking by ID
// @route GET /api/web/booking/:id
router.get("/web/booking/:id", protect, BookingController.getBookingById);

// @desc Get bookings by bookingNo
// @route GET /api/web/bookings/bookingNo/:bookingNo
router.get(
  "/web/bookings/bookingNo/:bookingNo",
  protect,
  BookingController.getBookingsByBookingNo
);

// @desc Get bookings by userID
// @route GET /api/web/bookings/user/:userID
router.get(
  "/web/bookings/user/:userID",
  protect,
  BookingController.getBookingsByUserId
);

// @desc Get bookings by hotelID
// @route POST /api/web/bookings/hotel
router.post(
  "/web/bookings/hotel",
  protect,
  BookingController.getBookingsByHotelId
);

// @desc Update booking status
// @route PUT /api/web/booking/status/:id
router.put(
  "/web/booking/status/:id",
  protect,
  BookingController.updateBookingStatus
);

// @desc Update an existing booking
// @route PUT /api/web/booking/:id
router.put("/web/booking/:id", protect, BookingController.updateBooking);

// @desc Soft delete a booking (legacy method)
// @route PUT /api/web/booking/soft/:id
router.put("/web/booking/soft/:id", protect, BookingController.updateStatusID);

// @desc Delete a booking
// @route DELETE /api/web/booking/:id
router.delete("/web/booking/:id", protect, BookingController.deleteBooking);

module.exports = router;
