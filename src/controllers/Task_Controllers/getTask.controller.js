import { Task } from "../../models/task.model.js";

export const getTaskController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not Authorized" });
    }

    const task = await Task.find({ user: req.user._id });

    if (task.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task fetched successfully",
      task,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Task fetched failed",
      error,
    });
  }
};
