import SupportRequest from "../../models/supportRequest.model.js";

// Create a new support request
export const createSupportRequest = async (req, res) => {
  try {
    const { name, email, subject, category, message, priority } = req.body;
    const userId = req.user ? req.user._id : null;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject, and message are required",
      });
    }

    // Create new support request
    const supportRequest = new SupportRequest({
      userId,
      name,
      email,
      subject,
      category: category || "general",
      message,
      priority: priority || "medium",
      status: "open",
      submittedAt: new Date(),
    });

    await supportRequest.save();

    res.status(201).json({
      success: true,
      message: "Support request submitted successfully",
      data: {
        id: supportRequest._id,
        subject: supportRequest.subject,
        category: supportRequest.category,
        status: supportRequest.status,
        submittedAt: supportRequest.submittedAt,
      },
    });
  } catch (error) {
    console.error("Error creating support request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while submitting support request",
    });
  }
};

// Get all support requests for admin (future use)
export const getAllSupportRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    // Add status filter if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Add category filter if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Add priority filter if provided
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    const supportRequests = await SupportRequest.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email");

    const total = await SupportRequest.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        supportRequests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching support requests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching support requests",
    });
  }
};

// Get support requests for a specific user
export const getUserSupportRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const supportRequests = await SupportRequest.find({ userId })
      .sort({ submittedAt: -1 })
      .select("subject category priority status submittedAt updatedAt");

    res.status(200).json({
      success: true,
      data: supportRequests,
    });
  } catch (error) {
    console.error("Error fetching user support requests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching your support requests",
    });
  }
};

// Update support request status (for admin use)
export const updateSupportRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const supportRequest = await SupportRequest.findById(id);

    if (!supportRequest) {
      return res.status(404).json({
        success: false,
        message: "Support request not found",
      });
    }

    supportRequest.status = status;
    supportRequest.updatedAt = new Date();

    if (adminResponse) {
      supportRequest.adminResponse = adminResponse;
      supportRequest.respondedAt = new Date();
    }

    await supportRequest.save();

    res.status(200).json({
      success: true,
      message: "Support request updated successfully",
      data: supportRequest,
    });
  } catch (error) {
    console.error("Error updating support request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating support request",
    });
  }
};
