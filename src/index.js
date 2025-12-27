import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/db.js";

const PORT = process.env.PORT || 3000;

console.log("Starting server...");
console.log("Environment:", process.env.NODE_ENV);
console.log("Port:", PORT);
console.log("MongoDB URI available:", !!process.env.MONGODB_URI);
console.log("DB_URL available:", !!process.env.DB_URL);

// Debug: Check if we have any database-related env vars
const envVars = Object.keys(process.env).filter(key => 
  key.toLowerCase().includes('mongo') || key.toLowerCase().includes('db')
);
console.log("Database-related env vars:", envVars);

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
