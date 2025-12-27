import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/db.js";

const PORT = process.env.PORT || 3000;

console.log("Starting server...");
console.log("Environment:", process.env.NODE_ENV);
console.log("Port:", PORT);

// Start server first, then try to connect to database
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  
  // Try to connect to database after server is running
  connectDB()
    .then(() => {
      console.log("✅ Database connected successfully");
    })
    .catch((err) => {
      console.error("❌ Database connection failed, but server is still running:", err.message);
      console.log("⚠️  Some features may not work without database connection");
    });
});

export default app;
