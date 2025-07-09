const mongoose = require("mongoose");

// Price range schema
const priceRangeSchema = new mongoose.Schema(
  {
    dates: {
      type: [
        {
          type: Date,
          required: true,
        },
      ],
      required: true,
      validate: [dateArrayLimit, "Price range must include exactly 2 dates"],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    taxes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

// Nearby places schema
const nearbyPlaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    distance: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

// Image schema
const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    size: {
      type: Number,
    },
    type: {
      type: String,
    },
  },
  { _id: false }
);

// Category schema
const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
    },
    categoryDetails: {
      type: String,
    },
    adultCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    childCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [imageSchema],
      default: [],
    },
    priceRanges: {
      type: [priceRangeSchema],
      default: [],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "At least one price range is required",
      },
    },
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
    hotelId: {
      type: mongoose.Schema.Types.ObjectId, // Changed from String to ObjectId
      ref: "Hotel", // Added reference
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    categories: {
      type: [categorySchema],
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "At least one category is required",
      },
    },
    whatsNearby: {
      type: [nearbyPlaceSchema],
      default: [],
    },
    policies: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Ensure virtuals are included when converted to JSON
    toObject: { virtuals: true },
  }
);

// Add index for better query performance
webHotelDetailsSchema.index({ hotelId: 1, name: 1 });

module.exports = mongoose.model("WebHotelDetails", webHotelDetailsSchema);
