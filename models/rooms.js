const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    price: {
      type: String,
      default: true,
    },
    bookings: [
      {
        checkInDate: {
          type: Date,
          required: true,
        },
        checkOutDate: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
