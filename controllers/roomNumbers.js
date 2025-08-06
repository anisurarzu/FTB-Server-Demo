const RoomNumbers = require("../models/RoomNumbers");
const WebHotelDetails = require("../models/WebHotelDetails");

// @desc Get all room numbers for a hotel
// @route GET /api/room-numbers/hotel/:hotelId
const getRoomNumbersByHotelId = async (req, res) => {
  try {
    const roomNumbers = await RoomNumbers.find({
      hotelId: req.params.hotelId,
    }).sort({ roomNumber: 1 });

    res.status(200).json(roomNumbers);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch room numbers",
      details: error.message,
    });
  }
};

// @desc Get all room numbers
// @route GET /api/room-numbers
const getAllRoomNumbers = async (req, res) => {
  try {
    const roomNumbers = await RoomNumbers.find().sort({ createdAt: -1 });
    res.status(200).json(roomNumbers);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch all room numbers",
      details: error.message,
    });
  }
};
// @desc Get room numbers by hotel ID and category ID
// @route GET /api/room-numbers/hotel/:hotelId/category/:categoryId
const getRoomNumbersByHotelAndCategory = async (req, res) => {
  const { hotelId, categoryId } = req.params;

  try {
    const roomNumbers = await RoomNumbers.find({ hotelId, categoryId }).sort({
      roomNumber: 1,
    });

    res.status(200).json(roomNumbers);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch room numbers by hotel and category",
      details: error.message,
    });
  }
};

// @desc Get room numbers by category
// @route GET /api/room-numbers/category/:categoryId
const getRoomNumbersByCategory = async (req, res) => {
  try {
    const roomNumbers = await RoomNumbers.find({
      categoryId: req.params.categoryId,
    }).sort({ roomNumber: 1 });

    res.status(200).json(roomNumbers);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch room numbers",
      details: error.message,
    });
  }
};

// @desc Create new room number
// @route POST /api/room-numbers
const mongoose = require("mongoose");

const createRoomNumber = async (req, res) => {
  try {
    const { hotelId, categoryId, roomNumber } = req.body;

    if (!hotelId || !categoryId || !roomNumber) {
      return res.status(400).json({
        error: "Hotel ID, Category ID and Room Number are required",
      });
    }

    // Find hotel by custom field `hotelId` instead of _id
    const hotel = await WebHotelDetails.findOne({ hotelId });
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    // Check if category exists in the hotel
    const categoryExists = hotel.categories.some((cat) => {
      if (!cat) return false;
      const catIdMatch = cat._id?.toString() === categoryId;
      const nameMatch = cat.categoryName === categoryId;
      return catIdMatch || nameMatch;
    });

    if (!categoryExists) {
      return res
        .status(404)
        .json({ error: "Category not found in the specified hotel" });
    }

    // Check if room number already exists
    const existing = await RoomNumbers.findOne({
      hotelId,
      categoryId,
      roomNumber,
    });

    if (existing) {
      return res.status(409).json({
        error: "This room number already exists for the specified category",
      });
    }

    // Create new room number
    const newRoomNumber = await RoomNumbers.create(req.body);
    res.status(201).json(newRoomNumber);
  } catch (error) {
    res.status(400).json({
      error: "Validation failed",
      details: error.message,
    });
  }
};

// @desc Update room number
// @route PUT /api/room-numbers/:id
const updateRoomNumber = async (req, res) => {
  try {
    const { roomNumber } = req.body;

    // Check if updating room number would cause a duplicate
    if (roomNumber) {
      const existingRoom = await RoomNumbers.findOne({
        hotelId: req.body.hotelId,
        categoryId: req.body.categoryId,
        roomNumber,
        _id: { $ne: req.params.id },
      });

      if (existingRoom) {
        return res.status(409).json({
          error: "This room number already exists for the specified category",
        });
      }
    }

    const updatedRoomNumber = await RoomNumbers.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedRoomNumber) {
      return res.status(404).json({ error: "Room number not found" });
    }

    res.status(200).json(updatedRoomNumber);
  } catch (error) {
    res.status(400).json({
      error: "Update failed",
      details: error.message,
    });
  }
};

// @desc Delete room number
// @route DELETE /api/room-numbers/:id
const deleteRoomNumber = async (req, res) => {
  try {
    const deletedRoomNumber = await RoomNumbers.findByIdAndDelete(
      req.params.id
    );

    if (!deletedRoomNumber) {
      return res.status(404).json({ error: "Room number not found" });
    }

    res.status(200).json({
      message: "Room number deleted successfully",
      deletedId: deletedRoomNumber._id,
    });
  } catch (error) {
    res.status(500).json({
      error: "Deletion failed",
      details: error.message,
    });
  }
};

module.exports = {
  getAllRoomNumbers,
  getRoomNumbersByHotelId,
  getRoomNumbersByCategory,
  getRoomNumbersByHotelAndCategory,
  createRoomNumber,
  updateRoomNumber,
  deleteRoomNumber,
};
