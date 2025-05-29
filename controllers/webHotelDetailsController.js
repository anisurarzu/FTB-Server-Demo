const WebHotelDetails = require("../models/WebHotelDetails");

// @desc Get all web hotel details
// @route GET /api/web-hotel-details
const getAllWebHotelDetails = async (req, res) => {
  try {
    const webHotelDetails = await WebHotelDetails.find().sort({
      createdAt: -1,
    });
    res.status(200).json(webHotelDetails);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch hotel details",
      details: error.message,
    });
  }
};

// @desc Get web hotel details by ID
// @route GET /api/web-hotel-details/:id
const getWebHotelDetailsById = async (req, res) => {
  try {
    // Find by hotelId instead of _id
    const webHotelDetails = await WebHotelDetails.findOne({
      hotelId: req.params.id,
    });

    if (!webHotelDetails) {
      return res.status(404).json({ error: "Web hotel details not found" });
    }

    res.status(200).json(webHotelDetails);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch hotel details",
      details: error.message,
    });
  }
};
// @desc Create new web hotel details
// @route POST /api/web-hotel-details
const createWebHotelDetails = async (req, res) => {
  try {
    const { hotelId, name, location, rating, roomTypes } = req.body;

    // Validate required fields
    if (!hotelId || !name || !location) {
      return res.status(400).json({
        error: "Hotel ID, name, and location are required",
      });
    }

    // Check for duplicate hotelId
    const existing = await WebHotelDetails.findOne({ hotelId });
    if (existing) {
      return res.status(409).json({
        error: "A hotel with this hotelId already exists",
      });
    }

    // Process room types data
    const processedRoomTypes = processRoomTypes(roomTypes);

    const webHotelDetails = await WebHotelDetails.create({
      ...req.body,
      roomTypes: processedRoomTypes,
    });

    res.status(201).json(webHotelDetails);
  } catch (error) {
    res.status(400).json({
      error: "Validation failed",
      details: error.message,
    });
  }
};

// @desc Update web hotel details
// @route PUT /api/web-hotel-details/:id
const updateWebHotelDetails = async (req, res) => {
  try {
    const { roomTypes } = req.body;

    // Process room types data if provided
    const updateData = roomTypes
      ? { ...req.body, roomTypes: processRoomTypes(roomTypes) }
      : req.body;

    const webHotelDetails = await WebHotelDetails.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!webHotelDetails) {
      return res.status(404).json({ error: "Web hotel details not found" });
    }

    res.status(200).json(webHotelDetails);
  } catch (error) {
    res.status(400).json({
      error: "Update failed",
      details: error.message,
    });
  }
};

// @desc Delete web hotel details
// @route DELETE /api/web-hotel-details/:id
const deleteWebHotelDetails = async (req, res) => {
  try {
    const webHotelDetails = await WebHotelDetails.findByIdAndDelete(
      req.params.id
    );
    if (!webHotelDetails) {
      return res.status(404).json({ error: "Web hotel details not found" });
    }
    res.status(200).json({
      message: "Web hotel details deleted successfully",
      deletedId: webHotelDetails._id,
    });
  } catch (error) {
    res.status(500).json({
      error: "Deletion failed",
      details: error.message,
    });
  }
};

// Helper function to process room types data
const processRoomTypes = (roomTypes = []) => {
  return roomTypes.map((room) => ({
    name: room.name?.trim(),
    description: room.description?.trim(),
    amenities: Array.isArray(room.amenities)
      ? room.amenities.map((a) => a?.trim()).filter(Boolean)
      : [],
    roomImages: Array.isArray(room.roomImages)
      ? room.roomImages.slice(0, 3) // Enforce max 3 images
      : [],
    options: Array.isArray(room.options)
      ? room.options.map((option) => ({
          type: option.type?.trim(),
          adults: Number(option.adults) || 1,
          price: Number(option.price) || 0,
          originalPrice: Number(option.originalPrice) || 0,
          discountPercent: Math.min(
            Math.max(Number(option.discountPercent) || 0, 0),
            100
          ),
          taxes: Number(option.taxes) || 0,
          breakfast: Boolean(option.breakfast),
          cancellation: option.cancellation?.trim(),
        }))
      : [],
  }));
};

module.exports = {
  getAllWebHotelDetails,
  getWebHotelDetailsById,
  createWebHotelDetails,
  updateWebHotelDetails,
  deleteWebHotelDetails,
};
