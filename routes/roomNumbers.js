const express = require("express");
const router = express.Router();
const {
  getAllRoomNumbers,
  getRoomNumbersByHotelId,
  getRoomNumbersByCategory,
  getRoomNumbersByHotelAndCategory,
  createRoomNumber,
  updateRoomNumber,
  deleteRoomNumber,
} = require("../controllers/roomNumbers");

// Get all room numbers
router.get("/", getAllRoomNumbers);

// Get all room numbers for a hotel
router.get("/hotel/:hotelId", getRoomNumbersByHotelId);

// Get room numbers by category
router.get("/category/:categoryId", getRoomNumbersByCategory);

// Get room numbers by hotel ID and category ID
router.get(
  "/hotel/:hotelId/category/:categoryId",
  getRoomNumbersByHotelAndCategory
);

// Create new room number
router.post("/", createRoomNumber);

// Update room number
router.put("/:id", updateRoomNumber);

// Delete room number
router.delete("/:id", deleteRoomNumber);

module.exports = router;
