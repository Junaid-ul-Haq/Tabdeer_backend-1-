import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import connectDB, { isMongoConnected } from "./config/db.js";
import routes from "./routes/indexRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// CORS configuration - allow both HTTP and HTTPS origins
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "http://tadbeerresource.com",
  "https://tadbeerresource.com",
  "http://www.tadbeerresource.com",
  "https://www.tadbeerresource.com",
  "http://localhost:3000",
].filter(Boolean); // Remove undefined values

// CORS configuration with explicit methods and headers
// CORS configuration with explicit methods and headers
app.use(
  cors({
    origin: function (origin, callback) {
      // Log the origin for debugging
      console.log("CORS Request from origin:", origin || "no origin");
      
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        console.log("Allowing request with no origin");
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        console.log("Origin allowed:", origin);
        callback(null, true);
      } else {
        // For development, allow all origins
        if (process.env.NODE_ENV !== "production") {
          console.log("Development mode: allowing origin:", origin);
          callback(null, true);
        } else {
          console.warn("CORS blocked origin:", origin);
          console.warn("Allowed origins:", allowedOrigins);
          callback(new Error("Not allowed by CORS"));
        }
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ✅ Serve uploaded files
app.use("/files", express.static(path.join(__dirname, "uploads")));

// ✅ Connect MongoDB (async - wait for connection)
connectDB().catch((error) => {
  console.error("Failed to connect to MongoDB:", error);
  process.exit(1);
});

// ✅ MongoDB connection check middleware
app.use((req, res, next) => {
  // Skip connection check for health check routes
  if (req.path === '/' || req.path === '/health') {
    return next();
  }
  
  const connectionState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  
  if (connectionState !== 1) {
    console.error(`❌ MongoDB not connected. State: ${connectionState} for ${req.method} ${req.path}`);
    return res.status(503).json({
      success: false,
      message: "Database connection unavailable. Please try again later.",
      connectionState: connectionState
    });
  }
  
  next();
});

// ✅ Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log("Headers:", req.headers);
  next();
});

// ✅ Use all routes
app.use("/", routes);

// ✅ Health check endpoint
app.get("/health", (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const mongoStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };
  
  res.json({
    status: "ok",
    message: "🚀 Tadbeer Backend API is running...",
    timestamp: new Date().toISOString(),
    mongodb: {
      status: mongoStates[mongoState] || "unknown",
      readyState: mongoState
    },
    environment: process.env.NODE_ENV || "development"
  });
});

// ✅ Test route
app.get("/", (req, res) => {
  res.send("🚀 Tadbeer Backend API is running...");
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

export default app;