const mongoose = require("mongoose");

const roomOptionSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    adults: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    discountPercent: { type: Number, min: 0, max: 100 },
    taxes: { type: Number, min: 0 },
    breakfast: { type: Boolean, default: false },
    cancellation: String,
  },
  { _id: false }
);

const roomTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amenities: { type: [String], default: [] },
    description: String,
    roomImages: {
      type: [String],
      default: [],
      validate: [arrayLimit, "{PATH} exceeds the limit of 3"],
    },
    options: { type: [roomOptionSchema], required: true },
  },
  { _id: false }
);

const nearbyPlaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    distance: { type: String, required: true },
  },
  { _id: false }
);

const webHotelDetailsSchema = new mongoose.Schema(
  {
    hotelId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    images: { type: [String], default: [] },
    roomTypes: { type: [roomTypeSchema], default: [] },
    whatsNearby: { type: [nearbyPlaceSchema], default: [] },
    facilities: { type: [String], default: [] },
    policies: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Validate that roomImages array doesn't exceed 3 items
function arrayLimit(val) {
  return val.length <= 3;
}

module.exports = mongoose.model("WebHotelDetails", webHotelDetailsSchema);
