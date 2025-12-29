import express from "express";
import {
  registerController,
  verifyOTPController,
  resendOTPController,
} from "../controllers/Auth_Controllers/register.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { loginController } from "../controllers/Auth_Controllers/login.controller.js";
import { updatePasswordController } from "../controllers/User_Controllers/updatePassword.controller.js";
import { userInfoController } from "../controllers/User_Controllers/userInfo.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { profilePicController } from "../controllers/User_Controllers/profilePic.controller.js";
import { deleteAccountController } from "../controllers/User_Controllers/deleteAccount.controller.js";
import {
  getUserLevel,
  updateUserLevel,
  incrementTasksCompleted,
} from "../controllers/User_Controllers/level.controller.js";

const authRoute = express.Router();

authRoute.get("/", (req, res) => {
  res.send("Ai Task Manager API");
});

// Authentication routes
authRoute.post("/register", registerController);
authRoute.post("/verify-otp", verifyOTPController);
authRoute.post("/resend-otp", resendOTPController);
authRoute.post("/login", loginController);

authRoute.get("/userinfo", authMiddleware, userInfoController);

authRoute.put("/updatePassword", authMiddleware, updatePasswordController);

authRoute.post(
  "/profilePic",
  authMiddleware,
  (req, res, next) => {
    upload.single("profilePic")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  profilePicController
);

authRoute.delete("/deleteAccount", authMiddleware, deleteAccountController);

// Level system routes
authRoute.get("/level", authMiddleware, getUserLevel);
authRoute.put("/level", authMiddleware, updateUserLevel);
authRoute.post("/level/increment", authMiddleware, incrementTasksCompleted);

export default authRoute;
