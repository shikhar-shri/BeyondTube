import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}, DB PORT: ${connectionInstance.connection.port}`
    );
  } catch (error) {
    console.log("MONGODB connection FAILED ", error);
    throw error;
    process.exit(1);
  }
};

// Graceful shutdown for MongoDB
const closeDB = async () => {
  try {
    await mongoose.connection.close(); // Ensures no new requests are accepted
    console.log("MongoDB connection closed gracefully.");
  } catch (error) {
    console.error("Error while closing MongoDB connection:", error);
  }
};

export { connectDB, closeDB };
