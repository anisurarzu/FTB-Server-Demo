const mongoose = require("mongoose");

// Define Booking schema
const BookingSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    nidPassport: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    hotelName: {
      type: String,
      required: [true, "Hotel name is required"],
      trim: true,
    },
    hotelID: {
      type: Number,
    },
    roomCategoryID: {
      type: String,
      required: [true, "Room category ID is required"],
    },
    roomCategoryName: {
      type: String,
      required: [true, "Room category name is required"],
      trim: true,
    },
    roomNumberID: {
      type: String,
      required: [true, "Room number ID is required"],
    },
    roomNumberName: {
      type: String,
      required: [true, "Room number name is required"],
      trim: true,
    },
    roomPrice: {
      type: Number,
      required: [true, "Room price is required"],
      min: [0, "Room price cannot be negative"],
    },
    checkInDate: {
      type: Date,
      required: [true, "Check-in date is required"],
    },
    checkOutDate: {
      type: Date,
      required: [true, "Check-out date is required"],
      validate: {
        validator: function (value) {
          return value > this.checkInDate;
        },
        message: "Check-out date must be after check-in date",
      },
    },
    nights: {
      type: Number,
      required: [true, "Number of nights is required"],
      min: [1, "Must stay at least one night"],
    },
    adults: {
      type: Number,
      default: 1,
      min: [1, "There must be at least one adult"],
    },
    children: {
      type: Number,
      default: 0,
      min: [0, "Number of children cannot be negative"],
    },
    totalBill: {
      type: Number,
      required: [true, "Total bill is required"],
      min: [0, "Total bill cannot be negative"],
    },
    advancePayment: {
      type: Number,
      required: [true, "Advance payment is required"],
      min: [0, "Advance payment cannot be negative"],
    },
    duePayment: {
      type: Number,
      required: [true, "Due payment is required"],
      min: [0, "Due payment cannot be negative"],
      validate: {
        validator: function (value) {
          return value === this.totalBill - this.advancePayment;
        },
        message: "Due payment must equal total bill minus advance payment",
      },
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      required: [true, "Transaction ID is required"],
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
    isKitchen: {
      type: Boolean,
      default: false,
    },
    extraBed: {
      type: Boolean,
      default: false,
    },
    bookedBy: {
      type: String,
      required: [true, "Booked by name is required"],
      trim: true,
    },
    bookedByID: {
      type: String,
      required: [true, "Booked by ID is required"],
    },
    updatedByID: {
      type: String,
    },
    bookingID: {
      type: String,
      required: [true, "Booking ID is required"],
    },
    bookingNo: {
      type: String,
      required: [true, "Booking number is required"],
      unique: true,
      trim: true,
    },
    serialNo: {
      type: Number,
    },
    kitchenTotalBill: {
      type: Number,
      default: 0,
      min: [0, "Kitchen bill cannot be negative"],
    },
    extraBedTotalBill: {
      type: Number,
      default: 0,
      min: [0, "Extra bed bill cannot be negative"],
    },
    reference: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancel", "completed"],
      default: "pending",
    },
    statusID: {
      type: Number,
      enum: [1, 2, 255], // 1=pending, 2=confirmed, 255=canceled
      default: 1,
    },
    canceledBy: {
      type: String,
    },
    reason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted check-in date
BookingSchema.virtual("formattedCheckInDate").get(function () {
  return this.checkInDate.toLocaleDateString();
});

// Virtual for formatted check-out date
BookingSchema.virtual("formattedCheckOutDate").get(function () {
  return this.checkOutDate.toLocaleDateString();
});

// Pre-save hook to ensure data consistency
BookingSchema.pre("save", function (next) {
  // Calculate due payment if not set
  if (this.isModified("totalBill") || this.isModified("advancePayment")) {
    this.duePayment = this.totalBill - this.advancePayment;
  }

  // Ensure status and statusID are in sync
  if (this.isModified("status")) {
    switch (this.status) {
      case "pending":
        this.statusID = 1;
        break;
      case "confirmed":
        this.statusID = 2;
        break;
      case "canceled":
        this.statusID = 255;
        break;
    }
  } else if (this.isModified("statusID")) {
    switch (this.statusID) {
      case 1:
        this.status = "pending";
        break;
      case 2:
        this.status = "confirmed";
        break;
      case 255:
        this.status = "canceled";
        break;
    }
  }

  next();
});

module.exports = mongoose.model("UserBooking", BookingSchema);
