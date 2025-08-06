const express = require("express");
const router = express.Router();
const webHotelDetailsController = require("../controllers/webHotelDetailsController");

// WebHotelDetails routes
router.get("/", webHotelDetailsController.getAllWebHotelDetails);
router.get("/:id", webHotelDetailsController.getWebHotelDetailsById);
router.get("/:id", webHotelDetailsController.getCategoriesByHotelId);
router.post("/", webHotelDetailsController.createWebHotelDetails);
router.put("/:id", webHotelDetailsController.updateWebHotelDetails);
router.delete("/:id", webHotelDetailsController.deleteWebHotelDetails);

module.exports = router;
