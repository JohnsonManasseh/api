const express = require("express");
const Booking = require("../models/booking");
const router = express.Router();

router.post("/addbooking", async (req, res) => {
  try {
    const { customerName, checkInDate, checkOutDate, status } = req.body;

    if (!customerName || !checkInDate || !checkOutDate || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newBooking = new Booking({
      customerName,
      checkInDate,
      checkOutDate,
      status,
    });

    await newBooking.save();
    res.status(201).json({ newBooking, message: "Your booking is reserved" });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ message: "Failed to create booking" });
  }
});

router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find();
    if (bookings.length === 0) {
      return res.status(200).json({ message: "No bookings available" });
    }
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

module.exports = router;
