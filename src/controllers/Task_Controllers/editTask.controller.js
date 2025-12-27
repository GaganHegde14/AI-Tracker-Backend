import { Task } from "../../models/task.model.js";

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

    task.title = title;
    task.description = description;
    task.dueDate = dueDate;
    task.priority = priority;
    task.steps = steps;
    task.timeEstimate = timeEstimate;
    task.improvedText = improvedText;
    task.status = status;

    await task.save();

    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
