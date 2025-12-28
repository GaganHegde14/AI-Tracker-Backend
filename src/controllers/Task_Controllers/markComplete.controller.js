import { Task } from "../../models/task.model.js";
import { User } from "../../models/user.model.js";

export const markCompleteController = async (req, res) => {
  try {
    console.log("🚀 Mark complete controller called");
    console.log("Task ID:", req.params.id);
    console.log("User ID:", req.user._id);

    if (!req.user) {
      console.log("❌ No user found in request");
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.params.id) {
      console.log("❌ No task ID provided");
      return res.status(400).json({ message: "Task ID is required" });
    }

    // Find the task
    console.log("🔍 Finding task...");
    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log("❌ Task not found");
      return res.status(404).json({ message: "Task not found" });
    }

    console.log("✅ Task found:", { id: task._id, currentStatus: task.status });

    // Check authorization
    if (!task.user || task.user.toString() !== req.user._id.toString()) {
      console.log("❌ User not authorized for this task");
      return res
        .status(401)
        .json({ message: "You are not authorized to edit this task" });
    }

    // Check if already completed
    if (task.status === "Completed") {
      console.log("⚠️ Task already completed");
      return res.status(200).json({
        message: "Task already completed",
        alreadyCompleted: true,
      });
    }

    // Mark as completed
    console.log("✅ Marking task as completed...");
    task.status = "Completed";  // Use correct enum value with capital C

    console.log("💾 Saving task...");
    await task.save();
    console.log("✅ Task saved successfully!");

    // Update user level
    try {
      console.log("📈 Updating user level...");
      const user = await User.findById(req.user._id);

      if (user) {
        console.log("Current user stats:", {
          username: user.username || user.email,
          level: user.level || 0,
          tasksCompleted: user.tasksCompleted || 0,
        });

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

        const previousLevel = user.level || 0;
        user.level = newLevel;

        console.log("💾 Saving user level...");
        await user.save();
        console.log("✅ User level updated successfully!");

        console.log(`🎉 Level update complete:`, {
          tasksCompleted: user.tasksCompleted,
          newLevel,
          previousLevel,
          leveledUp: newLevel > previousLevel,
        });
      } else {
        console.log("❌ User not found for level update");
      }
    } catch (levelError) {
      console.error("❌ Error updating user level:", levelError);
      // Don't fail the whole operation if level update fails
    }

    console.log("🎉 Mark complete operation successful!");
    res.status(200).json({
      message: "Task marked as completed successfully",
      success: true,
    });
  } catch (error) {
    console.error("❌ Mark complete error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Internal server error" });
  }
};
