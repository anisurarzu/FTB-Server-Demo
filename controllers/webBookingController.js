const UserBooking = require("../models/WebBooking");
const mongoose = require("mongoose");

// Helper function to generate a serial number for today's bookings
const generateSerialNo = async () => {
  try {
    // Find the last booking by insertion order (using `_id` in descending order)
    const lastBooking = await UserBooking.findOne().sort({ _id: -1 });

    // Increment serial number based on the last serialNo, or start at 1 if no previous booking exists
    const newSerialNo = lastBooking ? lastBooking.serialNo + 1 : 1;

    return newSerialNo;
  } catch (error) {
    console.error("Error generating serial number:", error);
    throw new Error("Could not generate serial number");
  }
};

const generateBookingNo = async () => {
  const currentDate = new Date();

  // Get current year, month, and day
  const year = currentDate.getFullYear().toString().slice(-2); // Last two digits of the year
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Month, zero-padded
  const day = currentDate.getDate().toString().padStart(2, "0"); // Day, zero-padded

  // Generate the prefix for the booking number
  const datePrefix = `${year}${month}${day}`;

  // Fetch all booking numbers that match the current date prefix
  const bookings = await UserBooking.find(
    { bookingNo: { $regex: `^${datePrefix}` } }, // Match bookings with the same date prefix
    { bookingNo: 1 }
  );

  // Determine the maximum serial number for today's bookings
  let maxSerialNo = 0;
  bookings.forEach((booking) => {
    if (booking.bookingNo) {
      // Extract the serial number from the bookingNo
      const serialNo = parseInt(booking.bookingNo.slice(-2), 10); // Last 2 digits for serial
      if (serialNo > maxSerialNo) {
        maxSerialNo = serialNo;
      }
    }
  });

  // Increment the maximum serial number to generate the new booking number
  const newSerialNo = (maxSerialNo + 1).toString().padStart(2, "0"); // Zero-padded
  const newBookingNo = `${datePrefix}${newSerialNo}`;

  return newBookingNo;
};

// @desc Create a new booking with default 'pending' status
// @route POST /api/bookings
const createBooking = async (req, res) => {
  const bookingData = req.body;

  try {
    let bookingNo;
    const serialNo = await generateSerialNo();

    // Check if the reference exists (i.e., the booking is associated with an existing bookingNo)
    if (bookingData.reference) {
      const referenceBooking = await UserBooking.findOne({
        bookingNo: bookingData.reference,
      });

      if (referenceBooking) {
        // Use the existing bookingNo from the reference
        bookingNo = referenceBooking.bookingNo;
      } else {
        // If the reference bookingNo does not exist, generate a new booking number
        bookingNo = await generateBookingNo();
      }
    } else {
      // Generate a new booking number if no reference is provided
      bookingNo = await generateBookingNo();
    }

    // Create the new booking with default status
    const booking = await UserBooking.create({
      ...bookingData,
      bookingNo,
      serialNo,
      status: "pending", // Default status
      statusID: 1, // Assuming 1 = pending
    });

    res.status(200).json({ message: "Booking created successfully", booking });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc Update booking status with special handling for cancellations
// @route PUT /api/bookings/status/:id
const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status, canceledBy, reason } = req.body;

  try {
    const updateData = { status };

    // Handle different status updates
    switch (status.toLowerCase()) {
      case "cancel":
        updateData.statusID = 255;
        updateData.canceledBy = canceledBy;
        updateData.reason = reason;
        break;
      case "confirmed":
        updateData.statusID = 2; // Assuming 2 = confirmed
        break;
      case "pending":
        updateData.statusID = 1; // Assuming 1 = pending
        break;
      // Add more status cases as needed
      default:
        // If status isn't recognized, keep the existing statusID
        break;
    }

    const booking = await UserBooking.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json({
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc Update an existing booking
// @route PUT /api/bookings/:id
const updateBooking = async (req, res) => {
  const { id } = req.params;
  const bookingData = req.body;

  try {
    const booking = await UserBooking.findByIdAndUpdate(id, bookingData, {
      new: true,
    });
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json({ message: "Booking updated successfully", booking });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc Get all bookings
// @route GET /api/bookings
const getBookings = async (req, res) => {
  try {
    const bookings = await UserBooking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Get bookings by hotelID
// @route GET /api/bookings/hotel/:hotelID
const getBookingsByHotelId = async (req, res) => {
  const { hotelID } = req.body;

  try {
    const numericHotelID = Number(hotelID);

    if (isNaN(numericHotelID)) {
      return res
        .status(400)
        .json({ error: "Invalid hotelID. Must be a number." });
    }

    const bookings = await UserBooking.find({ hotelID: numericHotelID }).sort({
      createdAt: -1,
    });

    if (bookings.length === 0) {
      return res
        .status(404)
        .json({ error: "No bookings found for this hotel ID" });
    }

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Get multiple bookings by bookingNo
const getBookingsByBookingNo = async (req, res) => {
  const { bookingNo } = req.params;

  try {
    const bookings = await UserBooking.find({ bookingNo: bookingNo });

    if (bookings.length === 0) {
      return res
        .status(404)
        .json({ error: "No bookings found for this booking number" });
    }

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Get a single booking
// @route GET /api/bookings/:id
const getBookingById = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await UserBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Soft delete booking (legacy method)
const updateStatusID = async (req, res) => {
  const { id } = req.params;
  const { canceledBy, reason } = req.body;

  try {
    const booking = await UserBooking.findByIdAndUpdate(
      id,
      {
        statusID: 255,
        canceledBy,
        reason,
      },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json({
      message: "Booking status updated to 255, canceledBy and reason updated.",
      updatedBooking: booking,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// @desc Get all bookings by userID
// @route GET /api/bookings/user/:userID
const WebHotel = require("../models/WebHotel");
const getBookingsByUserId = async (req, res) => {
  const { userID } = req.params;

  try {
    const bookings = await UserBooking.find({ bookedByID: userID }).sort({
      createdAt: -1,
    });

    if (bookings.length === 0) {
      return res
        .status(404)
        .json({ error: "No bookings found for this user ID" });
    }

    // Enrich bookings with the first hotel image (from WebHotel model)
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const hotel = await WebHotel.findOne(
          { _id: booking.hotelID },
          { image: 1 }
        );

        return {
          ...booking.toObject(),
          hotelImage: hotel?.image?.[0] || null, // Return only the first image
        };
      })
    );

    res.status(200).json(enrichedBookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Delete a booking
// @route DELETE /api/bookings/:id
const deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await UserBooking.findByIdAndDelete(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// In your BookingController.js
const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  console.log(`Cancellation request for booking ID: ${id}`); // Debug log

  // Validate booking ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log("Invalid booking ID format:", id); // Debug log
    return res.status(400).json({
      success: false,
      error: "Invalid booking ID format",
    });
  }

  try {
    // Debug: Log before find operation
    console.log("Attempting to find booking:", id);

    // Find the booking first to ensure it exists
    const booking = await UserBooking.findById(id).lean();

    if (!booking) {
      console.log("Booking not found:", id); // Debug log
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    // Debug: Log current booking status
    console.log("Current booking status:", {
      status: booking.status,
      statusID: booking.statusID,
    });

    // Check if booking is already cancelled
    if (booking.statusID === 255) {
      console.log("Booking already cancelled:", id); // Debug log
      return res.status(400).json({
        success: false,
        error: "Booking is already cancelled",
        booking, // Return current state for reference
      });
    }

    // Prepare update data
    const updateData = {
      status: "cancelled",
      statusID: 255,
      cancelledAt: new Date(),
      reason: reason || "Cancelled by user",
      canceledBy: req.user?._id || "system",
      updatedAt: new Date(), // Explicitly update this field
    };

    console.log("Update data:", updateData); // Debug log

    // Update booking status
    const updatedBooking = await UserBooking.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      session: await mongoose.startSession(), // Use transaction for safety
    }).session(options.session);

    console.log("Updated booking:", updatedBooking); // Debug log

    if (!updatedBooking) {
      console.error("Update operation failed but no error thrown");
      return res.status(500).json({
        success: false,
        error: "Update operation failed unexpectedly",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("[CANCELLATION ERROR DETAILS]", {
      message: error.message,
      stack: error.stack,
      error: error,
    });

    res.status(500).json({
      success: false,
      error: "Failed to cancel booking",
      systemError:
        process.env.NODE_ENV === "development"
          ? {
              message: error.message,
              stack: error.stack,
            }
          : undefined,
      suggestion: "Check server logs for detailed error information",
    });
  }
};

module.exports = {
  createBooking,
  updateBooking,
  updateBookingStatus,
  getBookings,
  getBookingsByHotelId,
  getBookingById,
  deleteBooking,
  getBookingsByBookingNo,
  updateStatusID,
  getBookingsByUserId,
  cancelBooking,
};
