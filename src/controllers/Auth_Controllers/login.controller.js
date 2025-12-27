import { User } from "../../models/user.model.js";
import { comparePassword } from "../../utils/hashPassword.util.js";

export const loginController = async (req, res) => {
  try {
    console.log("Login request received:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      console.log("User not found:", email);
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await comparePassword(password, checkUser.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = await checkUser.createJWT();

    console.log("Login successful for user:", email);
    res.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
