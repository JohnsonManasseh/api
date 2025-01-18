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

const uri =
  "mongodb+srv://johnsonmanasseh:YiWCL5opmNnZww6D@veladunecluster.w2ru8.mongodb.net/?retryWrites=true&w=majority&appName=VeladuneCluster";
mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
