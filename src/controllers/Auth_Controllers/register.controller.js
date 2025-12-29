import { User } from "../../models/user.model.js";
import { hashPassword } from "../../utils/hashPassword.util.js";
import jwt from "jsonwebtoken";
import {
  isEmailDomainAllowed,
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
} from "../../config/emailService.js";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, profilePic } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        field: "validation",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
        field: "email",
      });
    }

    // Check email domain (only major providers allowed)
    if (!isEmailDomainAllowed(email)) {
      return res.status(400).json({
        message:
          "Please use a verified email from major providers (Gmail, Yahoo, Outlook, etc.). Temporary emails are not allowed for security reasons.",
        field: "email",
        type: "domain_not_allowed",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
        field: "password",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({
        message:
          "An account with this email already exists. Please log in instead.",
        field: "email",
        type: "user_exists",
      });
    }

    // Hash password
    const hashpass = await hashPassword(password);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user;
    if (existingUser && !existingUser.isEmailVerified) {
      // Update existing unverified user
      user = existingUser;
      user.name = name;
      user.password = hashpass;
      user.profilePic = profilePic || "";
      user.emailOTP = otp;
      user.otpExpiresAt = otpExpiry;
      user.tempUserData = { name, email, profilePic };
    } else {
      // Create new user (unverified)
      user = new User({
        name,
        email,
        password: hashpass,
        profilePic: profilePic || "",
        isEmailVerified: false,
        emailOTP: otp,
        otpExpiresAt: otpExpiry,
        tempUserData: { name, email, profilePic },
      });
    }

    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, name);

    if (!emailResult.success) {
      // Delete user if email fails
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        message: "Failed to send verification email. Please try again.",
        type: "email_failed",
      });
    }

    const response = {
      message:
        "Registration initiated! Please check your email for verification code.",
      userId: user._id,
      email: email,
      requiresVerification: true,
      type: "otp_sent",
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Registration error:", error);

    // Handle specific errors
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email already exists",
        field: "email",
        type: "duplicate_email",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid user data provided",
        type: "validation_error",
      });
    }

    res.status(500).json({
      message: "Server error during registration. Please try again.",
      type: "server_error",
    });
  }
};

// New endpoint for OTP verification
export const verifyOTPController = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        message: "User ID and OTP are required",
        type: "missing_fields",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found. Please register again.",
        type: "user_not_found",
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "Email is already verified. Please log in.",
        type: "already_verified",
      });
    }

    // Check OTP expiry
    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new verification code.",
        type: "otp_expired",
        expired: true,
      });
    }

    // Verify OTP
    if (user.emailOTP !== otp) {
      return res.status(400).json({
        message: "Invalid verification code. Please try again.",
        type: "invalid_otp",
      });
    }

    // Mark as verified and clear OTP data
    user.isEmailVerified = true;
    user.emailOTP = null;
    user.otpExpiresAt = null;
    user.tempUserData = null;

    await user.save();

    // Create JWT token for automatic login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });

    // Send welcome email (optional, don't block if it fails)
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.log("Welcome email failed, but continuing:", emailError.message);
    }

    res.status(200).json({
      message: "Email verified successfully! Welcome to AI Task Manager!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        level: user.level,
        tasksCompleted: user.tasksCompleted,
      },
      type: "verification_success",
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      message: "Server error during verification. Please try again.",
      type: "server_error",
    });
  }
};

// Resend OTP endpoint
export const resendOTPController = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        type: "missing_user_id",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found. Please register again.",
        type: "user_not_found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "Email is already verified",
        type: "already_verified",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailOTP = otp;
    user.otpExpiresAt = otpExpiry;
    await user.save();

    // Send new OTP
    const emailResult = await sendOTPEmail(user.email, otp, user.name);

    if (!emailResult.success) {
      return res.status(500).json({
        message: "Failed to send verification email. Please try again.",
        type: "email_failed",
      });
    }

    res.status(200).json({
      message: "New verification code sent to your email!",
      type: "otp_resent",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      message: "Server error. Please try again.",
      type: "server_error",
    });
  }
};
