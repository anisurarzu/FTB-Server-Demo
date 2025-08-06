// controllers/webHotelDetails.js
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
    const { hotelId, name, categories } = req.body;

    if (!hotelId || !name) {
      return res.status(400).json({
        error: "Hotel ID and name are required",
      });
    }

    const existing = await WebHotelDetails.findOne({ hotelId });
    if (existing) {
      return res.status(409).json({
        error: "A hotel with this hotelId already exists",
      });
    }

    const processedCategories = processCategories(categories);

    const webHotelDetails = await WebHotelDetails.create({
      ...req.body,
      categories: processedCategories,
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
    const { categories } = req.body;

    const updateData = {
      ...req.body,
      ...(categories && { categories: processCategories(categories) }),
    };

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

// Helper to process categories
const processCategories = (categories = []) => {
  return categories.map((category) => ({
    categoryName: category.categoryName?.trim(),
    categoryDetails: category.categoryDetails?.trim(),
    adultCount: Number(category.adultCount) || 0,
    childCount: Number(category.childCount) || 0,
    amenities: Array.isArray(category.amenities)
      ? category.amenities.map((a) => a?.trim()).filter(Boolean)
      : [],
    images: Array.isArray(category.images)
      ? category.images.map((img) => ({
          url: img.url,
          name: img.name || "category_image",
          size: img.size || 0,
          type: img.type || "image/jpeg",
        }))
      : [],
    priceRanges: Array.isArray(category.priceRanges)
      ? category.priceRanges.map((range) => ({
          dates: range.dates?.slice(0, 2).map((d) => new Date(d)),
          price: Number(range.price) || 0,
          discountPercent: Math.min(
            Math.max(Number(range.discountPercent) || 0, 0),
            100
          ),
          taxes: Number(range.taxes) || 0,
        }))
      : [],
  }));
};

// @desc Get categories by hotel ID
// @route GET /api/web-hotel-details/:id/categories
const getCategoriesByHotelId = async (req, res) => {
  try {
    const webHotelDetails = await WebHotelDetails.findOne({
      hotelId: req.params.id,
    });

    if (!webHotelDetails) {
      return res.status(404).json({ error: "Web hotel details not found" });
    }

    // Return only the categories array
    res.status(200).json(webHotelDetails.categories || []);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch hotel categories",
      details: error.message,
    });
  }
};

module.exports = {
  getAllWebHotelDetails,
  getWebHotelDetailsById,
  createWebHotelDetails,
  updateWebHotelDetails,
  deleteWebHotelDetails,
  getCategoriesByHotelId,
};
