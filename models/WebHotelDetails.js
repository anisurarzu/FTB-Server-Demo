// models/WebHotelDetails.js
const mongoose = require("mongoose");

// Price range schema
const priceRangeSchema = new mongoose.Schema(
  {
    dates: {
      type: [Date],
      required: true,
      validate: [dateArrayLimit, "Price range must include exactly 2 dates"],
    },
    price: { type: Number, required: true },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    taxes: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

// Nearby places schema
const nearbyPlaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    distance: { type: String, required: true },
  },
  { _id: false }
);

// Category schema
const categorySchema = new mongoose.Schema(
  {
    categoryName: { type: String, required: true },
    categoryDetails: String,
    adultCount: { type: Number, default: 0, min: 0 },
    childCount: { type: Number, default: 0, min: 0 },
    amenities: { type: [String], default: [] },
    images: [
      {
        url: { type: String, required: true },
        name: String,
        size: Number,
        type: String,
      },
    ],
    priceRanges: { type: [priceRangeSchema], default: [] },
  },
  { _id: false }
);

// Limit validation function
function dateArrayLimit(val) {
  return val.length === 2;
}

// Main schema
const webHotelDetailsSchema = new mongoose.Schema(
  {
    hotelId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    categories: { type: [categorySchema], required: true },
    whatsNearby: { type: [nearbyPlaceSchema], default: [] },
    policies: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WebHotelDetails", webHotelDetailsSchema);
