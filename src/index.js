import dotenv from "dotenv";
import { connectDB, closeDB } from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: "./.env" });

connectDB()
  .then(() => {
    // console.log("connection with db successful.");
    const server = app.listen(process.env.PORT || 8000, () => {
      console.log(`App is listening on port: ${process.env.PORT}`);
    });

    const gracefulShutdown = (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);

      // Close the HTTP server
      server.close(async () => {
        console.log("HTTP server closed.");

        // Close MongoDB connection
        await closeDB();
        process.exit(0);
      });
    };

    // Handle termination signals
    process.on("SIGINT", () => gracefulShutdown("SIGINT")); // Ctrl+C
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM")); // Docker stop or similar
  })
  .catch((error) => {
    console.log("mongo db connection failed!", error);
  });

/*
(async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    console.log(
      `MongoDB connected !! DB host: ${connectionInstance.connection.host}`
    );

    app.on("error", (error) => {
      console.log("ERROR: ", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port: ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
})();
*/
