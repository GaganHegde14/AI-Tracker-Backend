import { User } from "../../models/user.model.js";
import { comparePassword } from "../../utils/hashPassword.util.js";

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        type: "missing_fields",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "No account found with this email address",
        type: "user_not_found",
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email address before logging in",
        type: "email_not_verified",
        userId: user._id,
        requiresVerification: true,
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect password. Please try again.",
        type: "invalid_password",
      });
    }

    const token = await user.createJWT();

    res.status(200).json({
      message: "Login successful! Welcome back!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        level: user.level,
        tasksCompleted: user.tasksCompleted,
      },
      type: "login_success",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error during login. Please try again.",
      type: "server_error",
    });
  }
};
