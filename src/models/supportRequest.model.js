import mongoose from "mongoose";

const supportRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow anonymous support requests
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["general", "bug", "feature", "billing", "account"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },
    adminResponse: {
      type: String,
      required: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
supportRequestSchema.index({ userId: 1, submittedAt: -1 });
supportRequestSchema.index({ status: 1, submittedAt: -1 });
supportRequestSchema.index({ category: 1, submittedAt: -1 });
supportRequestSchema.index({ priority: 1, submittedAt: -1 });

const SupportRequest = mongoose.model("SupportRequest", supportRequestSchema);

export default SupportRequest;
