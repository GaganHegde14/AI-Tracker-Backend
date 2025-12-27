import { User } from "../../models/user.model.js";
import { hashPassword } from "../../utils/hashPassword.util.js";

export const registerController = async (req, res) => {
  try {
    console.log("Registration request received:", req.body);
    const { name, email, password, profilePic } = req.body;

    if (!name || !email || !password) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      console.log("Password too short");
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const checkUser = await User.findOne({ email });
    if (checkUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    const hashpass = await hashPassword(password);

    const user = new User({ name, email, password: hashpass, profilePic });

    const token = await user.createJWT();

    await user.save();

    console.log("User registered successfully:", email);
    res.status(200).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
