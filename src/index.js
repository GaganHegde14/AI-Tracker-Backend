import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/db.js";

connectDB()
  .then(() => {
    if (process.env.NODE_ENV !== "production") {
      app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
      });
    }
  })
  .catch((err) => {
    console.log("failed to connect server", err);
  });

export default app;
