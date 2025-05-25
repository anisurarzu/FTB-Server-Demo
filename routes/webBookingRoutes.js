const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const BookingController = require("../controllers/webBookingController");

// @desc Create a new booking
// @route POST /api/bookings
router.post("/web/booking", protect, BookingController.createBooking);

// @desc Get all bookings
// @route GET /api/bookings
router.get("/web/bookings", BookingController.getBookings);

// @desc Get a single booking by ID
// @route GET /api/bookings/:id
router.get("/web/booking/:id", protect, BookingController.getBookingById);

// @desc Get bookings by bookingNo
// @route GET /api/bookings/bookingNo/:bookingNo
router.get(
  "/web/bookings/bookingNo/:bookingNo",
  protect,
  BookingController.getBookingsByBookingNo
);

// @desc Get bookings by userID
// @route GET /api/bookings/user/:userID
router.get(
  "/web/bookings/user/:userID",
  protect,
  BookingController.getBookingsByUserId
);

// @desc Get bookings by hotelID
// @route POST /api/bookings/getBookingByHotelID
router.post(
  "/web/getBookingByHotelID",
  protect,
  BookingController.getBookingsByHotelId
);

// @desc Update an existing booking
// @route PUT /api/bookings/:id
router.put("/web/booking/:id", protect, BookingController.updateBooking);

// @desc Soft delete a booking (update statusID)
// @route PUT /api/bookings/soft/:id
router.put("/web/booking/soft/:id", protect, BookingController.updateStatusID);

// @desc Delete a booking
// @route DELETE /api/bookings/:id
router.delete("/web/booking/:id", protect, BookingController.deleteBooking);

module.exports = router;
