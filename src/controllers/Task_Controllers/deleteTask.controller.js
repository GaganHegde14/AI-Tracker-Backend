import { Task } from "../../models/task.model.js";
import { User } from "../../models/user.model.js";

export const deleteTaskController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!task.user || task.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "You are not authorized to delete this task" });
    }

    await task.deleteOne();
    await User.findByIdAndUpdate(req.user._id, { $pull: { tasks: task._id } });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
