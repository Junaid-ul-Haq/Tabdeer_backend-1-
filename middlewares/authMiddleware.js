import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Protect routes: verify JWT token
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found or account has been deleted. Please login again.",
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.name === "TokenExpiredError" 
        ? "Token expired, please login again" 
        : "Not authorized, invalid token",
    });
  }
};

// Authorize roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: [${roles.join(
          ", "
        )}], but got '${req.user.role}'`,
      });
    }
    next();
  };
};
