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

export default app;