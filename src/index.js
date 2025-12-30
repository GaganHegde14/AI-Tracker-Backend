import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/db.js";

const PORT = process.env.PORT || 3000;

console.log("🚀 Server starting...");
console.log("Environment:", process.env.NODE_ENV);
console.log("Port:", PORT);
console.log("MongoDB URI available:", !!process.env.MONGODB_URI);
console.log(
  "Email service configured:",
  !!process.env.EMAIL_HOST && !!process.env.EMAIL_PASS
);
console.log("DB_URL available:", !!process.env.DB_URL);

// Debug: Check if we have any database-related env vars
const envVars = Object.keys(process.env).filter(
  (key) =>
    key.toLowerCase().includes("mongo") || key.toLowerCase().includes("db")
);
console.log("Database-related env vars:", envVars);

// Debug: Show the actual MONGODB_URI (first 50 chars only for security)
if (process.env.MONGODB_URI) {
  console.log(
    "MONGODB_URI preview:",
    process.env.MONGODB_URI.substring(0, 50) + "..."
  );
  console.log(
    "MONGODB_URI contains %40:",
    process.env.MONGODB_URI.includes("%40")
  );
}

// Start server first, then try to connect to database
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);

  // Try to connect to database after server is running
  connectDB()
    .then(() => {
      console.log("✅ Database connected successfully");
    })
    .catch((err) => {
      console.error(
        "❌ Database connection failed, but server is still running:",
        err.message
      );
      console.log("⚠️  Some features may not work without database connection");
    });
});

export default app;
