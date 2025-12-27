import { AiChat } from "../../models/aiChart.model.js";
import { Task } from "../../models/task.model.js";
import { User } from "../../models/user.model.js";

export const deleteAccountController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findByIdAndDelete(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const task = await Task.deleteMany({ user: req.user._id });

    const Aichats = await AiChat.deleteMany({ user: req.user._id });

    if (!task || !Aichats) {
      return res.status(404).json({ message: "Task or Chat not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
