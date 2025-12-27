import express from "express";
import taskRouter from "./routes/task.route.js";
import authRoute from "./routes/auth.route.js";
import supportRoute from "./routes/support.route.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.urlencoded({ extended: true }));

app.use("/", authRoute);

app.use("/task", taskRouter);

app.use("/support", supportRoute);

export default app;
