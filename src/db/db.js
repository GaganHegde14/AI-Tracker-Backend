import mongoose from 'mongoose'

const connectDB = async()=>{
   try {
      const dbUrl = process.env.MONGODB_URI || process.env.DB_URL;
      if (!dbUrl) {
         console.error("Database URL not found. Please set MONGODB_URI environment variable.");
         process.exit(1);
      }
      
      await mongoose.connect(dbUrl);
      console.log("Database connected successfully to:", dbUrl.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
      
   } catch (error) {
       console.error("Database connection error:", error);
       process.exit(1);
   }
}

export default connectDB