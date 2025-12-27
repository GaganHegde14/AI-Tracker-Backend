import express from "express";
import {
  createSupportRequest,
  getAllSupportRequests,
  getUserSupportRequests,
  updateSupportRequestStatus,
} from "../controllers/Support_Controllers/supportRequest.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public route - create support request (can be used by logged in or anonymous users)
router.post("/create", authMiddleware, createSupportRequest);

// Protected routes - require authentication
router.get("/my-requests", authMiddleware, getUserSupportRequests);

// Admin routes (future implementation)
router.get("/all", authMiddleware, getAllSupportRequests); // TODO: Add admin middleware
router.put("/update/:id", authMiddleware, updateSupportRequestStatus); // TODO: Add admin middleware

export default router;
