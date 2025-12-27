import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/db.js";

const PORT = process.env.PORT || 3000;

console.log("Starting server...");
console.log("Environment:", process.env.NODE_ENV);
console.log("Port:", PORT);

connectDB()
  .then(() => {
    console.log("Database connected, starting server...");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1);
  });

export default app;
