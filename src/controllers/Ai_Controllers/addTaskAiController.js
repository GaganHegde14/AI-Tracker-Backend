import GiminiAi from "../../config/aiTaskGenrator.js";
import { Task } from "../../models/task.model.js";

export const addTaskAiController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { aiInput } = req.body;

    if (!aiInput) {
      return res.status(400).json({ message: "Task is required" });
    }

    const currentDate = new Date().toISOString().split("T")[0];
    const callAiTask = await GiminiAi(aiInput, currentDate);

    let steps = callAiTask.steps;

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
      steps = steps.map((s) => (typeof s === "object" && s.step ? s.step : s));
    } else {
      steps = [];
    }

    const newTask = await Task.create({
      user: req.user._id,
      title: callAiTask.title,
      description: callAiTask.description,
      improvedText: callAiTask.improvedText,
      priority: callAiTask.priority,
      steps: steps,
      dueDate: callAiTask.dueDate,
      timeEstimate: callAiTask.timeEstimate,
      status: callAiTask.status,
    });

    res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: " Internal server error " });
  }
};
