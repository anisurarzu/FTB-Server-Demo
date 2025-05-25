const express = require("express");
const {
  register,
  login,
  getAllUsers,
  updateUser,
  updateStatusID,
  hardDeleteUser,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { loginUser, registerUser } = require("../controllers/webController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/web-register", registerUser);
router.post("/web-login", loginUser);

// Protected routes
router.get("/users", protect, getAllUsers); // Get all users
router.put("/users/:id", protect, updateUser); // Update user info

// Soft delete user (statusID=255)
router.put("/users/soft/:id", protect, updateStatusID);

// Hard delete user (remove from database)
router.delete("/users/hard/:id", protect, hardDeleteUser);

module.exports = router;
