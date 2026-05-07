import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

console.log("Attempting to connect to:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000 // 5 seconds timeout
})
.then(() => {
  console.log("SUCCESS: Connected to MongoDB!");
  process.exit(0);
})
.catch((err) => {
  console.error("FAILED: Could not connect to MongoDB.");
  console.error(err.message);
  process.exit(1);
});
