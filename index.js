const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bookingRoutes = require("./routes/bookings");

const multer = require("multer");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const upload = multer();
app.use(upload.none());
// app.use(express.json());
app.use("/", bookingRoutes);

const uri = process.env.MONGO_URI;
mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.get("/", (req, res) => {
  res.send("Start browsing the apis");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
