import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import routes from "./routes/indexRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// CORS configuration - allow both HTTP and HTTPS origins
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  // Production domains (with and without www, both protocols)
  "http://tadbeerresource.com",
  "https://tadbeerresource.com",
  "http://www.tadbeerresource.com",
  "https://www.tadbeerresource.com",
  // Development
  "http://localhost:3000",
  // Support multiple CORS origins from environment (comma-separated)
  ...(process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
    : []
  ),
].filter(Boolean); // Remove undefined/null values

// Normalize origin for comparison (remove trailing slash, lowercase)
const normalizeOrigin = (origin) => {
  if (!origin) return null;
  return origin.toLowerCase().replace(/\/$/, '');
};

// CORS configuration with explicit methods and headers
app.use(
  cors({
    origin: function (origin, callback) {
      // Log the origin for debugging
      console.log("🔍 CORS Request from origin:", origin || "no origin");
      console.log("🔍 NODE_ENV:", process.env.NODE_ENV);
      console.log("🔍 CORS_ORIGIN env:", process.env.CORS_ORIGIN);
      
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        console.log("✅ Allowing request with no origin");
        return callback(null, true);
      }

      // Normalize the incoming origin
      const normalizedOrigin = normalizeOrigin(origin);
      const normalizedAllowed = allowedOrigins.map(normalizeOrigin);

      // Check if origin is in allowed list (case-insensitive, no trailing slash)
      if (normalizedAllowed.includes(normalizedOrigin)) {
        console.log("✅ Origin allowed:", origin);
        callback(null, true);
      } else {
        // For development, allow all origins
        if (process.env.NODE_ENV !== "production") {
          console.log("⚠️ Development mode: allowing origin:", origin);
          callback(null, true);
        } else {
          console.error("❌ CORS blocked origin:", origin);
          console.error("❌ Normalized origin:", normalizedOrigin);
          console.error("❌ Allowed origins:", allowedOrigins);
          console.error("❌ Normalized allowed:", normalizedAllowed);
          callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
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

// ✅ Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log("Headers:", req.headers);
  next();
});

// ✅ Use all routes
app.use("/", routes);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("🚀 Tadbeer Backend API is running...");
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

export default app;