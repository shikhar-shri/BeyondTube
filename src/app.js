import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = new express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRoute from "./routes/user.routes.js";

//routes declaration
app.use("/api/v1/users", userRoute);

//Error handling middleware
app.use((err, req, res, next) => {
  // console.log("Inside error handling middleware");
  console.error(err.stack); // Log the error

  // Set the status code (default to 500)
  const statusCode = err.statusCode || 500;

  // Send a JSON response
  res.status(statusCode).json({
    error: {
      statusCode,
      message: err.message || "Internal Server Error",
    },
  });
});

export { app };
