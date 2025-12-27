import { AiChat } from "../../models/aiChart.model.js";

export const getAllChatController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user._id;

    const chats = await AiChat.find({ user: userId });

    if (!chats) {
      return res.status(404).json({
        success: false,
        message: "Chats not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Chats fetched successfully",
      data: chats,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
