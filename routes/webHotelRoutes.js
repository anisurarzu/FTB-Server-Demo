const express = require("express");
const router = express.Router();
const {
  getAllWebHotels,
  searchWebHotels,
  getTopSellingWebHotels,
  getWebHotelById,
  createWebHotel,
  updateWebHotel,
  deleteWebHotel,
} = require("../controllers/webHotelController");

router.get("/", getAllWebHotels);
router.get("/search", searchWebHotels); // 🔍 search route
router.get("/top-selling", getTopSellingWebHotels);
router.get("/:id", getWebHotelById);
router.post("/", createWebHotel);
router.put("/:id", updateWebHotel);
router.delete("/:id", deleteWebHotel);

module.exports = router;
