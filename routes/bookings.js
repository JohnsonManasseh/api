const express = require("express");
const Booking = require("../models/booking");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const JWT_SECRET = "johsdfsdfasfag442w4vnson";
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

router.post("/register", async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exitst please login" });
    }

    const newUser = new User({
      userName,
      email,
      password,
    });

    await newUser.save();
    const token = jwt.sign(
      { userId: newUser._id, userName: newUser.userName },
      JWT_SECRET,
      {
        expiresIn: "1hr",
      }
    );
    res.status(201).json({ token, message: "Registered successfully" });
  } catch (err) {
    console.error("Error creating booking:", err);
    res
      .status(500)
      .json({ message: "Failed to register please try again later" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Account not found, please signup" });
    }
    const token = jwt.sign(
      { userId: user._id, user: user.userName },
      JWT_SECRET,
      {
        expiresIn: "1hr",
      }
    );
    res.status(201).json({ token: token, message: "Logged in successfully" });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ message: "Failed to login" });
  }
});

module.exports = router;
