const express = require("express");
const Booking = require("../models/booking");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Room = require("../models/rooms");
const JWT_SECRET = "johsdfsdfasfag442w4vnson";
const router = express.Router();

router.post("/addbooking", async (req, res) => {
  try {
    const { customerName, checkInDate, checkOutDate, status, userId, roomId } =
      req.body;

    if (
      !customerName ||
      !checkInDate ||
      !checkOutDate ||
      !status ||
      !userId ||
      !roomId
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(400).json({ message: "Room not found" });
    }
    if (!room.availability) {
      return res.status(400).json({ message: "Room is not available" });
    }

    const newBooking = new Booking({
      customerName,
      checkInDate,
      checkOutDate,
      userId,
      status,
      roomId,
    });
    room.availability = false;
    room.bookings.push({ checkInDate, checkOutDate });
    await room.save();

    await newBooking.save();
    res.status(201).json({ newBooking, message: "Your booking is reserved" });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ message: "Failed to create booking" });
  }
});

router.put("/updatebooking", async (req, res) => {
  try {
    console.log(req.body);
    const { bookingId, checkInDate, checkOutDate, action, roomId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking id is required" });
    }
    if (!roomId) {
      return res.status(400).json({ message: "Room id is required" });
    }
    if (!checkInDate && !checkOutDate && !action) {
      return res
        .status(400)
        .json({ message: "either check in - out date or action is required" });
    }
    if (
      (checkInDate && !checkOutDate && roomId) ||
      (!checkInDate && checkOutDate && roomId)
    ) {
      return res.status(400).json({
        message:
          "Both 'checkInDate' and 'checkOutDate' must be provided to update booking dates.",
      });
    }

    if (
      (action && checkInDate && roomId) ||
      (action && checkOutDate && roomId)
    ) {
      return res.status(400).json({
        message:
          "'action' cannot be provided with 'checkInDate' and 'checkOutDate'.",
      });
    }

    const room = await Room.findById(roomId);
    const booking = await Booking.findById(bookingId);
    if (action === "cancel") {
      booking.status = "cancelled";
      room.availability = true;
      room.bookings = room.bookings.filter(
        (b) => b._id.toString() !== booking._id.toString()
      );

      // const cancelledBooking = await Booking.findByIdAndUpdate(
      //   id,
      //   { status: "cancelled" },
      //   { new: true }
      // );
      // if (!cancelledBooking) {
      //   return res.status(400).json({ message: "Booking not found" });
      // }
      await room.save();
      await booking.save();
      return res.status(200).json({
        booking,
        room,
        message: "Booking cancelled successfully",
      });
    }

    const updateFields = {};
    if (checkInDate) updateFields.checkInDate = checkInDate;
    if (checkOutDate) updateFields.checkOutDate = checkOutDate;

    if (Object.keys(updateFields) === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedBooking) {
      return res.status(400).json({ message: "No bookings found" });
    }

    res.status(200).json({
      message: "Bookings updated successfully",
      // booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking", error);
    res.status(500).json({ message: "Failed to update booking" });
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

router.post("/addroom", async (req, res) => {
  try {
    const { name, availability = true, price } = req.body;

    if (!name || !price) {
      return res.status(200).json({ message: "fields should not be empty" });
    }

    const newRoom = new Room({
      name,
      availability,
      price,
    });
    await newRoom.save();
    res.status(201).json({ newRoom, message: "Room added successfully" });
  } catch (err) {
    console.error("Error adding room:", err);
    res.status(500).json({ message: "Failed to add room" });
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
        .json({ message: "User already exists please login" });
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
    res
      .status(201)
      .json({ token, userId: newUser._id, message: "Registered successfully" });
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

router.get("/userdetails", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const bookings = await Booking.find({ userId: id });
    res.status(200).json({ user, bookings, message: "User details found" });
  } catch (err) {
    console.error("Error finding details", err);
    res.status(500).json({ message: "Failed to find user" });
  }
});

router.get("/updateuserdetails", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(201).json({ user, message: "User details found" });
  } catch (err) {
    console.error("Error finding details", err);
    res.status(500).json({ message: "Failed to find user" });
  }
});

router.delete("/deletebooking", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Booking id is required" });
    }

    const deleteBooking = await Booking.findByIdAndDelete(id);
    res
      .status(200)
      .json({ deleteBooking, message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error updating booking", error);
    res.status(500).json({ message: "Failed to delte booking" });
  }
});

router.put("/updateuserdetails", async (req, res) => {
  try {
    const { id, userName, email, phone } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User id is required" });
    }

    const updateFields = {};
    if (userName) updateFields.userName = userName;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;

    if (Object.keys(updateFields) === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(400).json({ message: "user not found" });
    }

    res
      .status(200)
      .json({ message: "UserDetails updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ message: "Failed to update user details" });
  }
});

router.delete("/deleteuser", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      res.status(400).json({ message: "User id is required" });
    }

    const deleteUser = await User.findByIdAndDelete(id);

    if (!deleteUser) {
      res.status(400).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully", deleteUser });
  } catch (error) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

module.exports = router;
