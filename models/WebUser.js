const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Function to generate unique loginID like FTB-{random4digits}
function generateLoginID() {
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit number
  return `FTB-${randomDigits}`;
}

const WebUserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    loginHistory: [
      {
        latitude: String,
        longitude: String,
        publicIP: String,
        privateIP: String,
        loginTime: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Hash the password before saving the user
WebUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); // Skip hashing if password is not modified (for example, on login)
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next(); // Continue saving the user
});

// Password comparison method

WebUserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("WebUser", WebUserSchema);
