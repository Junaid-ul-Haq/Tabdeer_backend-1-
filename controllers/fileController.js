const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

exports.getFile = async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const filePath = path.join(__dirname, "..", "uploads", folder, filename);

    console.log("🔍 Looking for file:", filePath);
    console.log("🔍 File exists:", fs.existsSync(filePath));

    if (!fs.existsSync(filePath))
      return res.status(404).json({ message: "File not found" });

    res.setHeader("Content-Type", mime.lookup(filePath) || "application/octet-stream");
    res.sendFile(filePath);
  } catch (error) {
    console.error("❌ Error serving file:", error);
    res.status(500).json({ message: "Error serving file" });
  }
};
