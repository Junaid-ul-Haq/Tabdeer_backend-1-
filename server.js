const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const routes = require("./routes/indexRoutes.js");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000", // your Next.js frontend
    credentials: true,
  })
);

app.use(express.json());

// ✅ Serve uploaded files
app.use("/files", express.static(path.join(__dirname, "uploads")));

// ✅ Connect MongoDB
connectDB();

// ✅ Use all routes
app.use("/", routes);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("🚀 Tadbeer Backend API is running...");
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

module.exports = app;   