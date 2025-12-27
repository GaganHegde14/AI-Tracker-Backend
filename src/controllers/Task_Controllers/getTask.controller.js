import { Task } from "../../models/task.model.js";

export const getTaskController = async (req, res) => {
  try {
    console.log(`📋 getTaskController called`);
    console.log(`📋 req.user:`, req.user);
    
    if (!req.user) {
      console.log(`📋 No user found in request`);
      return res.status(401).json({ message: "Not Authorized" });
    }

    console.log(`📋 Fetching tasks for user:`, req.user._id);
    const task = await Task.find({ user: req.user._id });
    console.log(`📋 Found ${task.length} tasks`);

    if (task.length === 0) {
      console.log(`📋 No tasks found, returning empty array instead of 404`);
      return res.status(200).json({
        success: true,
        message: "No tasks found",
        task: [],
      });
    }

    console.log(`📋 Returning ${task.length} tasks`);
    res.status(200).json({
      message: "Task fetched successfully",
      task,
    });
  } catch (error) {
    console.log(`📋 getTask error:`, error);

    res.status(500).json({
      message: "Task fetched failed",
      error: error.message,
    });
  }
};
