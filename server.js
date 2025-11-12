import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import routes from "./routes/indexRoutes.js";
import { testEmailConnection } from "./utils/emailService.js";

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

// ✅ Test Email Connection on Startup
(async () => {
  console.log("\n🔍 Testing Email Connection...");
  try {
    const emailStatus = await testEmailConnection();
    
    if (emailStatus.ready) {
      console.log("✅ EMAIL STATUS: READY TO SEND MESSAGES");
      console.log("📧 Email Configuration:");
      console.log("   - Host:", emailStatus.config.host);
      console.log("   - Port:", emailStatus.config.port);
      console.log("   - User:", emailStatus.config.user);
      console.log("   - Status:", emailStatus.message);
    } else {
      console.log("❌ EMAIL STATUS: NOT READY - Cannot send messages");
      console.log("⚠️  Error:", emailStatus.message);
      if (emailStatus.error) {
        console.log("   - Error Code:", emailStatus.error);
      }
      if (emailStatus.details) {
        console.log("   - Details:", emailStatus.details);
      }
      console.log("\n💡 Troubleshooting:");
      if (emailStatus.error === "EAUTH") {
        console.log("   - Verify EMAIL_USER and EMAIL_PASSWORD in .env file");
        console.log("   - For Gmail, make sure you're using an App Password (not your regular password)");
        console.log("   - Ensure 2-Step Verification is enabled on your Gmail account");
      } else if (emailStatus.error === "ECONNREFUSED" || emailStatus.error === "ETIMEDOUT") {
        console.log("   - Check your internet connection");
        console.log("   - Verify EMAIL_HOST and EMAIL_PORT in .env file");
        console.log("   - Check if firewall is blocking SMTP connections");
      } else if (emailStatus.message?.includes("EMAIL_PASSWORD")) {
        console.log("   - Add EMAIL_PASSWORD to your .env file");
        console.log("   - For Gmail, generate an App Password from Google Account settings");
      }
    }
    console.log(""); // Empty line for readability
  } catch (error) {
    console.error("❌ Failed to test email connection:", error.message);
    console.log("⚠️  Email service may not work properly\n");
  }
})();

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