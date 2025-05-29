const WebHotel = require("../models/WebHotel");

// @desc Get all web hotels
// @route GET /api/web-hotels
const getAllWebHotels = async (req, res) => {
  try {
    const webHotels = await WebHotel.find().sort({ createdAt: -1 });
    res.status(200).json(webHotels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Search web hotels
// @route GET /api/web-hotels/search
const searchWebHotels = async (req, res) => {
  try {
    const { name, location, minPrice, maxPrice, rating, topSelling } =
      req.query;

    let filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" }; // case-insensitive search
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (topSelling !== undefined) {
      filter.topSelling = topSelling === "true";
    }

    if (rating) {
      filter.rating = { $gte: Number(rating) }; // e.g., minimum 4-star hotels
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const webHotels = await WebHotel.find(filter).sort({ createdAt: -1 });
    res.status(200).json(webHotels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Get top selling web hotels
// @route GET /api/web-hotels/top-selling
const getTopSellingWebHotels = async (req, res) => {
  try {
    const webHotels = await WebHotel.find({ topSelling: true }).sort({
      createdAt: -1,
    });
    res.status(200).json(webHotels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Get a single web hotel by ID
// @route GET /api/web-hotels/:id
const getWebHotelById = async (req, res) => {
  const { id } = req.params;

  try {
    const webHotel = await WebHotel.findOne({ id: Number(id) });
    if (!webHotel) {
      return res.status(404).json({ error: "Web hotel not found" });
    }
    res.status(200).json(webHotel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Create a new web hotel
// @route POST /api/web-hotels
const createWebHotel = async (req, res) => {
  const webHotelData = req.body;

  try {
    if (!webHotelData.id) {
      const lastWebHotel = await WebHotel.findOne().sort({ id: -1 });
      webHotelData.id = lastWebHotel ? lastWebHotel.id + 1 : 1;
    }

    const webHotel = await WebHotel.create(webHotelData);
    res
      .status(201)
      .json({ message: "Web hotel created successfully", webHotel });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc Update a web hotel
// @route PUT /api/web-hotels/:id
const updateWebHotel = async (req, res) => {
  const { id } = req.params;
  const webHotelData = req.body;

  try {
    const webHotel = await WebHotel.findOneAndUpdate(
      { id: Number(id) },
      webHotelData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!webHotel) {
      return res.status(404).json({ error: "Web hotel not found" });
    }
    res
      .status(200)
      .json({ message: "Web hotel updated successfully", webHotel });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc Delete a web hotel
// @route DELETE /api/web-hotels/:id
const deleteWebHotel = async (req, res) => {
  const { id } = req.params;

  try {
    const webHotel = await WebHotel.findOneAndDelete({ id: Number(id) });
    if (!webHotel) {
      return res.status(404).json({ error: "Web hotel not found" });
    }
    res.status(200).json({ message: "Web hotel deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllWebHotels,
  searchWebHotels,
  getTopSellingWebHotels,
  getWebHotelById,
  createWebHotel,
  updateWebHotel,
  deleteWebHotel,
};
