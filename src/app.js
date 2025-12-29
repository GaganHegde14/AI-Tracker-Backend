import express from "express";
import taskRouter from "./routes/task.route.js";
import authRoute from "./routes/auth.route.js";
import supportRoute from "./routes/support.route.js";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

app.use(express.json());

// Simple CORS configuration for production
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000", 
      "http://127.0.0.1:5173",
      "https://ai-progress.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization", 
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })
);
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Origin:', req.get('origin'));
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.json({
    status: "OK",
    message: "AI Tracker Backend is running",
    timestamp: new Date().toISOString(),
    cors: "enabled",
    database: {
      status: dbStates[dbStatus] || "unknown",
      readyState: dbStatus,
    },
    environment: process.env.NODE_ENV || "development",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🚀 AI Tracker Backend API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/health",
      auth: "/auth",
      tasks: "/task",
      support: "/support",
    },
  });
});

// Debug endpoint to check environment variables (remove in production)
app.get("/debug-env", (req, res) => {
  const hasMongoUri = !!process.env.MONGODB_URI;
  const hasDbUrl = !!process.env.DB_URL;
  const mongoUriLength = process.env.MONGODB_URI
    ? process.env.MONGODB_URI.length
    : 0;
  const mongoUriStart = process.env.MONGODB_URI
    ? process.env.MONGODB_URI.substring(0, 20) + "..."
    : "not set";

  res.json({
    mongodb_uri_exists: hasMongoUri,
    db_url_exists: hasDbUrl,
    mongodb_uri_length: mongoUriLength,
    mongodb_uri_preview: mongoUriStart,
    node_env: process.env.NODE_ENV,
  });
});

app.use("/", authRoute);

app.use("/task", taskRouter);

app.use("/support", supportRoute);

export default app;
