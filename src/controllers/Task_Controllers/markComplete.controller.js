import { Task } from "../../models/task.model.js";
import { User } from "../../models/user.model.js";

export const markCompleteController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.params.id) {
      return res.status(400).json({ message: "Task ID is required" });
    }

    // Find the task
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check authorization
    if (!task.user || task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "You are not authorized to edit this task" });
    }

    // Check if already completed
    if (task.status === "Completed") {
      return res.status(200).json({
        message: "Task already completed",
        alreadyCompleted: true,
      });
    }

    // Mark as completed
    task.status = "Completed";
    await task.save();

    // Update user level
    try {
      const user = await User.findById(req.user._id);
      
      if (user) {
        // Increment tasks completed
        user.tasksCompleted = (user.tasksCompleted || 0) + 1;

        // Calculate new level
        let newLevel = 0;
        if (user.tasksCompleted >= 10000) newLevel = 10; // Mythic
        else if (user.tasksCompleted >= 5000) newLevel = 9; // Legend
        else if (user.tasksCompleted >= 2500) newLevel = 8; // Champion
        else if (user.tasksCompleted >= 1500) newLevel = 7; // Elite
        else if (user.tasksCompleted >= 1000) newLevel = 6; // Master
        else if (user.tasksCompleted >= 750) newLevel = 5; // Expert
        else if (user.tasksCompleted >= 500) newLevel = 4; // Skilled
        else if (user.tasksCompleted >= 300) newLevel = 3; // Rising
        else if (user.tasksCompleted >= 200) newLevel = 2; // Starter
        else if (user.tasksCompleted >= 100) newLevel = 1; // Rookie

        user.level = newLevel;
        await user.save();
      }
    } catch (levelError) {
      console.error("Error updating user level:", levelError);
      // Don't fail the whole operation if level update fails
    }

    res.status(200).json({ 
      message: "Task marked as completed successfully",
      success: true
    });

  } catch (error) {
    console.error("Error in markCompleteController:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};