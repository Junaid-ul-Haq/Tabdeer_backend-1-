// src/middlewares/validationMiddleware.js
export const validateConsultation = (req, res, next) => {
  const { fullName, email, phone, message } = req.body;

  if (!fullName || !email || !phone || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields (fullName, email, phone, message) are required",
    });
  }

  next();
};
