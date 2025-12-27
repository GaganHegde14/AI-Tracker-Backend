import { User } from "../../models/user.model.js";
import { hashPassword } from "../../utils/hashPassword.util.js";

export const registerController = async (req, res) => {
  try {
    console.log("Registration request received:", req.body);
    const { name, email, password, profilePic } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate password length
    if (password.length < 6) {
      console.log("Password too short");
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Check if user already exists
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    console.log("Hashing password...");
    const hashpass = await hashPassword(password);

    // Create new user
    console.log("Creating new user...");
    const user = new User({ name, email, password: hashpass, profilePic });
    
    // Save user first
    await user.save();
    console.log("User saved to database");

    // Create JWT token
    console.log("Creating JWT token...");
    const token = await user.createJWT();

    console.log("User registered successfully:", email);
    res.status(200).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Registration error details:", error);
    
    // More specific error messages
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Invalid user data" });
    }
    
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};
