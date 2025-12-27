import mongoose from 'mongoose'

const connectDB = async()=>{
   try {
      const dbUrl = process.env.MONGODB_URI || process.env.DB_URL;
      if (!dbUrl) {
         console.error("❌ Database URL not found. Please set MONGODB_URI environment variable.");
         console.log("📋 Example: mongodb+srv://username:password@cluster.mongodb.net/database");
         throw new Error("Database URL not configured");
      }
      
      // Debug: Show connection string format (hide credentials)
      const maskedUrl = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
      console.log("🔗 Attempting to connect to database:", maskedUrl);
      console.log("🔗 Connection string length:", dbUrl.length);
      console.log("🔗 Starts with mongodb+srv:", dbUrl.startsWith('mongodb+srv://'));
      
      // No connection options needed for Mongoose 6+
      await mongoose.connect(dbUrl);
      console.log("✅ Database connected successfully");
      
   } catch (error) {
       console.error("❌ Database connection error:", error);
       console.error("❌ Full error details:", JSON.stringify(error, null, 2));
       throw error; // Let the caller handle the error
   }
}

export default connectDB