import { User } from "../../models/user.model.js";
import { hashPassword } from "../../utils/hashPassword.util.js";

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

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
        field: "password",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message:
          "An account with this email already exists. Please log in instead.",
        field: "email",
        type: "user_exists",
      });
    }

    // Hash password
    const hashpass = await hashPassword(password);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashpass,
      profilePic: profilePic || "",
    });

    await user.save();

    // Create JWT token for automatic login
    const token = await user.createJWT();

    console.log("✅ User registered successfully:", email);

    res.status(201).json({
      message: "Registration successful! Welcome to AI Task Manager!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        level: user.level,
        tasksCompleted: user.tasksCompleted,
      },
      type: "registration_success",
    });
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
