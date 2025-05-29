const mongoose = require("mongoose");

const webHotelSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    amenities: [{ type: String }],
    price: { type: Number, required: true },
    discount: { type: String },
    rating: { type: Number, min: 0, max: 5 },
    image: { type: String },
    topSelling: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WebHotel", webHotelSchema);
