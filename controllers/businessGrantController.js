import BusinessGrant from "../models/businessGrantModel.js";
import User from "../models/userModel.js";
import paginate from "../utils/paginate.js";
import path from "path";
import fs from "fs";
import { getRelativePath } from "../middlewares/uploadMulterMiddleware.js";

// 📌 Create Business Grant (User)


exports.createBusinessGrant = async (req, res) => {
  try {
    const { title, description, amountRequested } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Limit user chances
    if (user.role === "user" && user.chancesLeft <= 0) {
      return res.status(400).json({
        success: false,
        message: "No chances left. You cannot submit more applications.",
      });
    }

    // ✅ Handle uploaded proposal
    let proposal = null;
    if (req.file) {
      // Ensure forward slashes for Windows paths
      const normalizedPath = req.file.path.replace(/\\/g, "/"); // C:/... → C:/...
      const relativePathIndex = normalizedPath.indexOf("/uploads/");
      const relativePath = relativePathIndex !== -1
        ? normalizedPath.slice(relativePathIndex + 1) // remove leading "/"
        : req.file.filename; // fallback to filename only

      proposal = {
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        filePath: `/files/${relativePath.replace("uploads/", "")}`, // final path starts with /files/
      };
    }

    // ✅ Create new grant
    const grant = await BusinessGrant.create({
      user: req.user._id,
      title,
      description,
      amountRequested,
      proposal,
    });

    // ✅ Reduce user chances
    if (user.role === "user") {
      user.chancesLeft -= 1;
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: "Business grant application submitted successfully.",
      data: grant,
      chancesLeft: user.chancesLeft,
    });
  } catch (error) {
    console.error("❌ Error creating business grant:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Get logged-in user's Business Grants
exports.getMyBusinessGrants = async (req, res) => {
  try {
    const grants = await BusinessGrant.find({ user: req.user._id }).sort({ createdAt: -1 });
    const host = `${req.protocol}://${req.get("host")}`;

    const mapped = grants.map((g) => {
      const proposal = g.proposal
        ? {
            fileName: g.proposal.fileName,
            fileType: g.proposal.fileType,
            filePath: g.proposal.filePath,
            url: `${host}${g.proposal.filePath}`,
          }
        : null;

      return { ...g.toObject(), proposal };
    });

    res.status(200).json({ success: true, grants: mapped });
  } catch (error) {
    console.error("❌ Error fetching user grants:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Get all Business Grants (Admin)
exports.getAllBusinessGrants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await paginate(BusinessGrant, {}, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: { path: "user", select: "name email" },
    });

    const host = `${req.protocol}://${req.get("host")}`;
    const mapped = result.data.map((g) => {
      const proposal = g.proposal
        ? {
            fileName: g.proposal.fileName,
            fileType: g.proposal.fileType,
            filePath: g.proposal.filePath,
            url: `${host}${g.proposal.filePath}`,
          }
        : null;

      return { ...g.toObject(), proposal };
    });

    res.status(200).json({
      success: true,
      data: mapped,
      page: result.page,
      totalPages: result.totalPages,
      totalRecords: result.total,
    });
  } catch (error) {
    console.error("❌ Error fetching all business grants:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Get Business Grant by ID (Admin)
exports.getBusinessGrantById = async (req, res) => {
  try {
    const { id } = req.params;

    const grant = await BusinessGrant.findById(id).populate({
      path: "user",
      select: "-password -role",
    });

    if (!grant) {
      return res.status(404).json({ success: false, message: "Business grant not found." });
    }

    const host = `${req.protocol}://${req.get("host")}`;
    const proposal = grant.proposal
      ? {
          fileName: grant.proposal.fileName,
          fileType: grant.proposal.fileType,
          filePath: grant.proposal.filePath,
          url: `${host}${grant.proposal.filePath}`,
        }
      : null;

    res.status(200).json({
      success: true,
      data: { ...grant.toObject(), proposal },
    });
  } catch (error) {
    console.error("❌ Error fetching business grant by ID:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Update Business Grant Status (Admin)
exports.updateBusinessGrantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const grant = await BusinessGrant.findById(id);
    if (!grant) {
      return res.status(404).json({ success: false, message: "Business grant not found" });
    }

    grant.status = status;
    if (adminNotes) grant.adminNotes = adminNotes;
    await grant.save();

    res.status(200).json({
      success: true,
      message: `Business grant ${status} successfully.`,
      data: grant,
    });
  } catch (error) {
    console.error("❌ Error updating business grant status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
