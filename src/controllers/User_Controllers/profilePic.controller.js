import cloudinary from "../../config/cloudinary.js";
import { User } from "../../models/user.model.js";

export const profilePicController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "profile_pics",
      width: 300,
      crop: "scale",
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: result.secure_url },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      data: user.profilePic,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile picture",
      error: error.message,
    });
  }
};
