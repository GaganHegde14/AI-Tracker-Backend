import express from "express";
import taskRouter from "./routes/task.route.js";
import authRoute from "./routes/auth.route.js";
import supportRoute from "./routes/support.route.js";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

app.use(express.json());

// Enhanced CORS configuration for production
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://ai-progress.vercel.app",
        process.env.CLIENT_URL,
      ].filter(Boolean);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
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

// Health check endpoint
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    status: "OK",
    message: "AI Tracker Backend is running",
    timestamp: new Date().toISOString(),
    cors: "enabled",
    database: {
      status: dbStates[dbStatus] || 'unknown',
      readyState: dbStatus
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint to check environment variables (remove in production)
app.get("/debug-env", (req, res) => {
  const hasMongoUri = !!process.env.MONGODB_URI;
  const hasDbUrl = !!process.env.DB_URL;
  const mongoUriLength = process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0;
  const mongoUriStart = process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'not set';
  
  res.json({
    mongodb_uri_exists: hasMongoUri,
    db_url_exists: hasDbUrl,
    mongodb_uri_length: mongoUriLength,
    mongodb_uri_preview: mongoUriStart,
    node_env: process.env.NODE_ENV
  });
});

app.use("/", authRoute);

app.use("/task", taskRouter);

app.use("/support", supportRoute);

export default app;
