import { ApiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken || req.get("Authorization")?.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Unauthorized request: No token provided");
  }

  try {
    const decodedToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "invalid access token");
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name == "TokenExpiredError") {
      throw new ApiError(401, "Unauthorized: Token expired");
    }

    if (err.name == "JsonWebTokenError") {
      throw new ApiError(401, "Unauthorized: Invalid token");
    }
  }
});
