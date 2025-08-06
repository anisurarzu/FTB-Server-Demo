const mongoose = require("mongoose");

const RoomNumbersSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WebHotelDetails",
    required: true,
  },
  hotelName: {
    type: String,
    required: false,
  },
  categoryId: {
    type: String,
    required: true,
  },
  roomNumber: {
    type: String,
    required: true,
    trim: true,
  },
  roomDetails: {
    type: String,
    trim: true,
    default: "",
  },
  roomImage: {
    type: String,
    trim: true,
    default: "",
  },
  isOccupied: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure room numbers are unique within a hotel category
RoomNumbersSchema.index(
  { hotelId: 1, categoryId: 1, roomNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("RoomNumbers", RoomNumbersSchema);
