import { Task } from "../../models/task.model.js";
import { User } from "../../models/user.model.js";

export const editTaskController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.params.id) {
      return res.status(400).json({ message: "Task ID is required" });
    }
    const {
      title,
      description,
      dueDate,
      priority,
      steps,
      timeEstimate,
      improvedText,
      status,
    } = req.body;

    if (
      !title ||
      !description ||
      !dueDate ||
      !priority ||
      !steps ||
      !timeEstimate
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!task.user || task.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "You are not authorized to Edit this task" });
    }

    // Check if task is being marked as completed for the first time
    const wasCompleted = task.status === "completed";
    const isNowCompleted = status === "completed";
    const justCompleted = !wasCompleted && isNowCompleted;

    task.title = title;
    task.description = description;
    task.dueDate = dueDate;
    task.priority = priority;
    task.steps = steps;
    task.timeEstimate = timeEstimate;
    task.improvedText = improvedText;
    task.status = status;

    await task.save();

    // If task was just completed, increment user's completed tasks and update level
    if (justCompleted) {
      try {
        const user = await User.findById(req.user._id);
        if (user) {
          user.tasksCompleted += 1;

          // Calculate new level based on tasks completed
          let newLevel = 0; // Beginner level for < 100 tasks
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

          const previousLevel = user.level;
          user.level = newLevel;
          await user.save();

          console.log(`🎉 User ${user.username} completed a task! Level: ${newLevel}, Tasks: ${user.tasksCompleted}, Leveled up: ${newLevel > previousLevel}`);
        }
      } catch (levelError) {
        console.error("Error updating user level:", levelError);
        // Don't fail the whole operation if level update fails
      }
    }

    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
