import { Task } from "../../models/task.model.js";
import { User } from "../../models/user.model.js";

export const addTaskController = async (req, res) => {
  try {
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

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

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

    const newTask = await Task.create({
      user: req.user._id,
      title,
      description,
      dueDate,
      priority,
      steps,
      timeEstimate,
      improvedText,
      status,
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { tasks: newTask._id },
    });

    res.status(201).json({ message: "Task added successfully", task: newTask });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Internal server error" });
  }
};
