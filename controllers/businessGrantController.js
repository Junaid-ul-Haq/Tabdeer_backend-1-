import BusinessGrant from "../models/businessGrantModel.js";
import BusinessGrantOpportunity from "../models/businessGrantOpportunityModel.js";
import User from "../models/userModel.js";
import paginate from "../utils/paginate.js";
import path from "path";
import fs from "fs";
import { getRelativePath } from "../middlewares/uploadMulterMiddleware.js";

// 📌 Create Business Grant (User)


export const createBusinessGrant = async (req, res) => {
  try {
    const { title, description, proposal: proposalText, opportunityId } = req.body;

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

    // ✅ Check credit hours (only for normal users)
    const creditHours = user.creditHours ?? user.chancesLeft ?? 0;
    if (user.role === "user" && creditHours <= 0) {
      return res.status(400).json({
        success: false,
        message: "No credit hours remaining. Please make a payment to get 3 credit hours for applications.",
      });
    }

    // ✅ Handle uploaded proposal file
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
      proposal: proposal || null,
      proposalText: proposalText || null, // Store text proposal if provided
      opportunityId: opportunityId || null, // Link to opportunity if provided
    });

    // ✅ Decrease user's credit hours (1 credit hour per application)
    if (user.role === "user") {
      user.creditHours = (user.creditHours ?? 0) - 1;
      user.chancesLeft = user.creditHours; // Keep in sync for backward compatibility
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: "Entrepreneur incubation application submitted successfully.",
      creditHours: user.creditHours ?? 0,
      chancesLeft: user.creditHours ?? 0, // return for backward compatibility
      data: grant,
    });
  } catch (error) {
    console.error("❌ Error creating business grant:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Get logged-in user's Business Grants
export const getMyBusinessGrants = async (req, res) => {
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
export const getAllBusinessGrants = async (req, res) => {
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
export const getBusinessGrantById = async (req, res) => {
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
export const updateBusinessGrantStatus = async (req, res) => {
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

// ==========================================
// BUSINESS GRANT OPPORTUNITIES (Admin)
// ==========================================

// @desc Create business grant opportunity (Admin)
export const createGrantOpportunity = async (req, res) => {
  try {
    const { city, amount, description } = req.body;

    if (!city || !amount) {
      return res.status(400).json({
        success: false,
        message: "City and amount are required",
      });
    }

    const opportunity = await BusinessGrantOpportunity.create({
      city,
      amount: parseFloat(amount),
      description: description || "",
      createdBy: req.user._id,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Business grant opportunity created successfully",
      opportunity,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all business grant opportunities (Admin)
export const getAllGrantOpportunities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    let query = {};
    if (search) {
      query = {
        $or: [
          { city: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }

    const result = await paginate(BusinessGrantOpportunity, query, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: { path: "createdBy", select: "name email" },
    });

    res.status(200).json({
      success: true,
      data: result.data,
      page: result.page,
      totalPages: result.totalPages,
      totalRecords: result.total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all active grant opportunities for users
export const getAllActiveGrantOpportunities = async (req, res) => {
  try {
    const opportunities = await BusinessGrantOpportunity.find({
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      opportunities,
      count: opportunities.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update grant opportunity (Admin)
export const updateGrantOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { city, amount, description, isActive } = req.body;

    const opportunity = await BusinessGrantOpportunity.findById(id);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Grant opportunity not found",
      });
    }

    if (city) opportunity.city = city;
    if (amount !== undefined) opportunity.amount = parseFloat(amount);
    if (description !== undefined) opportunity.description = description;
    if (isActive !== undefined) opportunity.isActive = isActive;

    await opportunity.save();

    res.status(200).json({
      success: true,
      message: "Grant opportunity updated successfully",
      opportunity,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete grant opportunity (Admin)
export const deleteGrantOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    const opportunity = await BusinessGrantOpportunity.findByIdAndDelete(id);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Grant opportunity not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Grant opportunity deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
