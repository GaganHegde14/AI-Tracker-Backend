import { User } from "../../models/user.model.js";

// Get user's level and tasks completed
export const getUserLevel = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "level tasksCompleted"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        level: user.level,
        tasksCompleted: user.tasksCompleted,
      },
    });
  } catch (error) {
    console.error("Error getting user level:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update user's level and tasks completed
export const updateUserLevel = async (req, res) => {
  try {
    const { level, tasksCompleted } = req.body;

    if (level === undefined || tasksCompleted === undefined) {
      return res.status(400).json({
        success: false,
        message: "Level and tasksCompleted are required",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        level: level,
        tasksCompleted: tasksCompleted,
      },
      { new: true }
    ).select("level tasksCompleted");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Level updated successfully",
      data: {
        level: user.level,
        tasksCompleted: user.tasksCompleted,
      },
    });
  } catch (error) {
    console.error("Error updating user level:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Increment tasks completed and update level accordingly
export const incrementTasksCompleted = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Increment tasks completed
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

    res.status(200).json({
      success: true,
      message: "Tasks completed incremented successfully",
      data: {
        level: user.level,
        tasksCompleted: user.tasksCompleted,
        leveledUp: newLevel > previousLevel,
      },
    });
  } catch (error) {
    console.error("Error incrementing tasks completed:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
