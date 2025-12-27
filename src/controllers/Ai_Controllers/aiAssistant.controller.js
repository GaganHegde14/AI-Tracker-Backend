import GiminiAiAssistant from "../../config/aiAssistantService.js";
import { AiChat } from "../../models/aiChart.model.js";
import { Task } from "../../models/task.model.js";
import { User } from "../../models/user.model.js";

export const aiAssistantController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { userMessage } = req.body;
    const userId = req.user._id;

    if (!userMessage) {
      return res.status(400).json({
        success: false,
        message: "Please provide a message ",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userTask = await Task.find({ user: userId });

    const aiResponse = await GiminiAiAssistant(userMessage, userTask, user);

    let chart = await AiChat.findOne({ user: userId });

    if (!chart) {
      chart = await AiChat.create({ user: userId });
    }

    chart.chats.push({
      role: "user",
      content: userMessage,
    });

    // Handle different AI actions
    switch (aiResponse.action) {
      case "CREATE_TASK":
        try {
          let steps = aiResponse.task.steps;

          // Handle case where AI returns steps as a stringified JSON
          if (typeof steps === "string") {
            try {
              steps = JSON.parse(steps);
            } catch (error) {
              steps = [steps]; // Fallback: treat as a single step
            }
          }

          // Ensure steps is an array of strings (extract 'step' property if it's an object)
          if (Array.isArray(steps)) {
            steps = steps.map((s) =>
              typeof s === "object" && s.step ? s.step : s
            );
          } else {
            steps = [];
          }

          const newTask = await Task.create({
            user: req.user._id,
            ...aiResponse.task,
            steps,
          });

          // Update User model to include the new task
          await User.findByIdAndUpdate(req.user._id, {
            $push: { tasks: newTask._id },
          });

          // Save AI response to chat history
          chart.chats.push({
            role: "assistant",
            content: `Activity created: ${newTask.title}`,
          });
          await chart.save();

          return res.status(201).json({
            success: true,
            action: "CREATE_TASK",
            message: `Activity "${newTask.title}" created successfully!`,
            data: newTask,
          });
        } catch (error) {
          console.error("Task creation error:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to create activity",
          });
        }

      case "EDIT_TASK":
        try {
          const taskToEdit = await Task.findOne({
            _id: aiResponse.taskId,
            user: userId,
          });

          if (!taskToEdit) {
            chart.chats.push({
              role: "assistant",
              content:
                "Activity not found. Please check the activity ID or title.",
            });
            await chart.save();

            return res.status(404).json({
              success: false,
              message: "Activity not found",
            });
          }

          // Update only provided fields
          Object.keys(aiResponse.updates).forEach((key) => {
            if (aiResponse.updates[key] !== undefined) {
              if (key === "dueDate" && aiResponse.updates[key]) {
                taskToEdit[key] = new Date(aiResponse.updates[key]);
              } else {
                taskToEdit[key] = aiResponse.updates[key];
              }
            }
          });

          await taskToEdit.save();

          chart.chats.push({
            role: "assistant",
            content: `Activity "${taskToEdit.title}" updated successfully!`,
          });
          await chart.save();

          return res.status(200).json({
            success: true,
            action: "EDIT_TASK",
            message: `Activity "${taskToEdit.title}" updated successfully!`,
            data: taskToEdit,
          });
        } catch (error) {
          console.error("Task edit error:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to update activity",
          });
        }

      case "DELETE_TASK":
        try {
          const taskToDelete = await Task.findOne({
            _id: aiResponse.taskId,
            user: userId,
          });

          if (!taskToDelete) {
            chart.chats.push({
              role: "assistant",
              content:
                "Activity not found. Please check the activity ID or title.",
            });
            await chart.save();

            return res.status(404).json({
              success: false,
              message: "Activity not found",
            });
          }

          const taskTitle = taskToDelete.title;
          await Task.findOneAndDelete({ _id: aiResponse.taskId, user: userId });

          // Remove task from user's task array
          await User.findByIdAndUpdate(userId, {
            $pull: { tasks: aiResponse.taskId },
          });

          chart.chats.push({
            role: "assistant",
            content: `Activity "${taskTitle}" deleted successfully!`,
          });
          await chart.save();

          return res.status(200).json({
            success: true,
            action: "DELETE_TASK",
            message: `Activity "${taskTitle}" deleted successfully!`,
          });
        } catch (error) {
          console.error("Task delete error:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to delete activity",
          });
        }

      case "LIST_TASKS":
        try {
          let filter = { user: userId };

          if (aiResponse.filter === "completed") {
            filter.completed = true;
          } else if (aiResponse.filter === "pending") {
            filter.completed = false;
          }

          const tasks = await Task.find(filter).sort({ createdAt: -1 });

          const tasksList = tasks
            .map(
              (task) =>
                `• ${task.title} (${
                  task.completed ? "Completed" : "Pending"
                }) - ${task.priority} priority`
            )
            .join("\n");

          const responseMessage =
            tasks.length > 0
              ? `Here are your ${aiResponse.filter || "all"} activities (${
                  tasks.length
                } total):\n\n${tasksList}`
              : `You don't have any ${aiResponse.filter || ""} activities yet.`;

          chart.chats.push({
            role: "assistant",
            content: responseMessage,
          });
          await chart.save();

          return res.status(200).json({
            success: true,
            action: "LIST_TASKS",
            message: responseMessage,
            data: tasks,
            filter: aiResponse.filter || "all",
          });
        } catch (error) {
          console.error("Task list error:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to retrieve activities",
          });
        }

      case "FIND_TASK":
        try {
          const searchQuery = aiResponse.searchQuery;
          const tasks = await Task.find({
            user: userId,
            $or: [
              { title: { $regex: searchQuery, $options: "i" } },
              { description: { $regex: searchQuery, $options: "i" } },
              { improvedText: { $regex: searchQuery, $options: "i" } },
            ],
          }).sort({ createdAt: -1 });

          const tasksList = tasks
            .map(
              (task) =>
                `• ${task.title} (${
                  task.completed ? "Completed" : "Pending"
                }) - ${task.priority} priority`
            )
            .join("\n");

          const responseMessage =
            tasks.length > 0
              ? `Found ${tasks.length} activities matching "${searchQuery}":\n\n${tasksList}`
              : `No activities found matching "${searchQuery}". Try different keywords.`;

          chart.chats.push({
            role: "assistant",
            content: responseMessage,
          });
          await chart.save();

          return res.status(200).json({
            success: true,
            action: "FIND_TASK",
            message: responseMessage,
            data: tasks,
            searchQuery,
          });
        } catch (error) {
          console.error("Task search error:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to search activities",
          });
        }

      case "TOGGLE_COMPLETE":
        try {
          const taskToToggle = await Task.findOne({
            _id: aiResponse.taskId,
            user: userId,
          });

          if (!taskToToggle) {
            chart.chats.push({
              role: "assistant",
              content:
                "Activity not found. Please check the activity ID or title.",
            });
            await chart.save();

            return res.status(404).json({
              success: false,
              message: "Activity not found",
            });
          }

          taskToToggle.completed = !taskToToggle.completed;
          await taskToToggle.save();

          const status = taskToToggle.completed ? "completed" : "reopened";
          const responseMessage = `Activity "${taskToToggle.title}" ${status} successfully!`;

          chart.chats.push({
            role: "assistant",
            content: responseMessage,
          });
          await chart.save();

          return res.status(200).json({
            success: true,
            action: "TOGGLE_COMPLETE",
            message: responseMessage,
            data: taskToToggle,
          });
        } catch (error) {
          console.error("Task toggle error:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to update activity status",
          });
        }

      case "CHAT":
      default:
        // Handle CHAT action: Save reply and send response
        chart.chats.push({
          role: "assistant",
          content:
            aiResponse.reply ||
            "I can help you manage your activities. Try asking me to create, edit, list, or find activities!",
        });
        await chart.save();

        return res.status(200).json({
          success: true,
          action: "CHAT",
          reply:
            aiResponse.reply ||
            "I can help you manage your activities. Try asking me to create, edit, list, or find activities!",
        });
    }
  } catch (error) {
    console.log(error);
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: "AI usage limit exceeded. Please try again later.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
