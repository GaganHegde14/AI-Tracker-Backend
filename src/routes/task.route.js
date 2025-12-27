import express from "express";
import { addTaskController } from "../controllers/Task_Controllers/addTask.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getTaskController } from "../controllers/Task_Controllers/getTask.controller.js";
import { deleteTaskController } from "../controllers/Task_Controllers/deleteTask.controller.js";
import { editTaskController } from "../controllers/Task_Controllers/editTask.controller.js";
import { addTaskAiController } from "../controllers/Ai_Controllers/addTaskAiController.js";
import { aiAssistantController } from "../controllers/Ai_Controllers/aiAssistant.controller.js";
import { getAllChatController } from "../controllers/Ai_Chats_controllers/getAllChat.controller.js";
import { deleteAllChatController } from "../controllers/Ai_Chats_controllers/deleteAllChat.controller.js";

const taskRouter = express.Router();

taskRouter.post("/addTask", authMiddleware, addTaskController);

taskRouter.get("/getTask", authMiddleware, getTaskController);

taskRouter.put("/edit/:id", authMiddleware, editTaskController);

taskRouter.delete("/deleteTask/:id", authMiddleware, deleteTaskController);

// AI routes

taskRouter.post("/ai/task", authMiddleware, addTaskAiController);

taskRouter.post("/ai/assistant", authMiddleware, aiAssistantController);

taskRouter.get("/ai/chats", authMiddleware, getAllChatController);

taskRouter.delete("/ai/chats", authMiddleware, deleteAllChatController);

export default taskRouter;
