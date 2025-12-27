import { User } from "../../models/user.model.js";

export const userInfoController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not Authorized" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "User fetched failed",
      error,
    });
  }
};
