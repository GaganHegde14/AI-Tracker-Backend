import mongoose from 'mongoose'

const connectDB = async()=>{
   try {
      const dbUrl = process.env.MONGODB_URI || process.env.DB_URL;
      if (!dbUrl) {
         console.error("❌ Database URL not found. Please set MONGODB_URI environment variable.");
         console.log("📋 Example: mongodb+srv://username:password@cluster.mongodb.net/database");
         throw new Error("Database URL not configured");
      }
      
      console.log("🔗 Attempting to connect to database...");
      await mongoose.connect(dbUrl);
      console.log("✅ Database connected successfully");
      
   } catch (error) {
       console.error("❌ Database connection error:", error.message);
       throw error; // Let the caller handle the error
   }
}

export default connectDB