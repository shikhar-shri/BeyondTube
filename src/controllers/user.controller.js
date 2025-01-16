import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { generateAccessAndRefreshTokens } from "../utils/generateAccessAndRefreshTokens.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend - done
  //validation -not empty- done
  //check if user already exists: username/email -done
  //check if user gave avatar or not. -done
  //if yes then check if multer uploaded it correctly or not -done
  //if yes then upload it to cloudinary - done
  //create user object- create entry in db -done
  //remove password and refresh token field from response- done
  //check for user creation- done
  //return response -done

  //   console.log("req body object: ", req.body);
  const { username, email, password, fullname } = req.body;
  //   console.log("username: ", username, "email: ", email);

  if (
    [username, email, password, fullname].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username: username }, { email: email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  console.log("req files object: ", req.files);

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  console.log("Avatar local path: ", avatarLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Avatar file couldn't be uploaded to cloudinary");
  }

  const coverImage = await uploadToCloudinary(coverImageLocalPath);

  //create() method creates and saves the doc in one step
  const user = await User.create({
    fullname,
    avatar: {
      url: avatar.url,
      public_id: avatar.public_id,
    },
    coverImage: {
      url: coverImage?.url,
      public_id: coverImage?.public_id,
    },
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id)
    .select("-password -refreshToken")
    .exec();

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  /*
    1. user inputs username/email... req.body->data
    2. find the user
    3. if user not found, register first msg
    4. if found, check for password
    5. if correct, send access and refresh token as cookies
    6. send a api response
    
    
    
    */

  //   console.log(req.body);

  const { username, email, password } = req.body;

  //   console.log("username: ", username);

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  if (!password) {
    throw new ApiError(400, "password is required");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  if (!incomingRefreshToken)
    throw new ApiError(401, "Unauthorized: No refresh token provided");

  const decodedToken = await jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken?._id);

  if (!user) throw new ApiError(401, "Invalid refresh token");

  //checking the incomingRefreshToken with one stored in the db
  /*
    
    Since the refresh token was issued by the server, the server doesn’t know if it was stolen, 
    unless additional validation checks are in place (e.g., checking the token against the database).
    
    */
  if (incomingRefreshToken !== user.refreshToken)
    throw new ApiError(401, "Refresh token is expired or used");

  //generate a new access token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Access token refreshed"
      )
    );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  /* verifyJWT-> chng password
    1. check for req.user since it is a secured functionality
    2. retrieve current and new password from req.body
    3. check if current password entered by the user matches with that stored in db
    4. if yes, update the password with the new password
  */

  const { currentPassword, newPassword } = req.body;

  const loggedInUser = await User.findById(req.user?._id);

  if (!(await loggedInUser.isPasswordCorrect(currentPassword)))
    throw new ApiError(401, "Unauthorized: current password is incorrect");

  loggedInUser.password = newPassword;
  await loggedInUser.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { username: loggedInUser.username, password: loggedInUser.password },
        "password updated successfully"
      )
    );
});

const changeUserAvatar = asyncHandler(async (req, res) => {
  /*
    req.user?
    req.file?
    1. Check if avatar file is stored locally correctly
    2. Delete existing avatar for the user from cloudinary
    3. upload the new avatar to cloudinary.
    4. update the cloudinary url for the user in db
    
    */
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) throw new ApiError(400, "Avatar field is required");

  const user = await User.findById(req.user?._id);
  const currentAvatarPublicId = user.avatar.public_id;
  /*
    pg0vsxot4ixphk4fr7mk
    
    */

  //   console.log("current avatar's public id: ", currentAvatarPublicId);

  await deleteFromCloudinary(currentAvatarPublicId);

  const newAvatar = await uploadToCloudinary(avatarLocalPath);

  if (!newAvatar)
    throw new ApiError(500, "Avatar file couldn't be uploaded to cloudinary");

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: {
          url: newAvatar.url,
          public_id: newAvatar.public_id,
        },
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) throw new ApiError(400, "Username is missing");

  const channel = await User.aggregate([
    {
      $match: { username: username },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers", //will be stored as an array of docs
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        isSubscribed: {
          $in: [req.user?._id, "$subscribers.subscriber"], //true/false depending on whether the current logged in user has subscribed to this channel or not
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel) throw new ApiError(404, "Channel does not exist");

  res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "Channel details fetched sucessfully")
    );
});

const getUserWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(String(req.user._id)),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$owner",
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "User's watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  changeUserAvatar,
  getUserChannelProfile,
  getUserWatchHistory,
};

/**
 * 
 * 
 *
accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzdlMjhlNjFkMjE3OGU3MTQzMjUyNmUiLCJlbWFpbCI6InJla2hhLnNyaTEyM0BnbWFpbC5jb20iLCJ1c2VybmFtZSI6InJla2hhMTIzIiwiaWF0IjoxNzM2MzI0MTk5LCJleHAiOjE3MzYzMjQyNTl9.f-vFIcfaV6gfNJPbqMNECotFVJyYi1u7nDahLXHGV4w; 

refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzdlMjhlNjFkMjE3OGU3MTQzMjUyNmUiLCJpYXQiOjE3MzYzMjQxOTksImV4cCI6MTczNzE4ODE5OX0.BXn9_l91jAtjOQY9QrE8zt0n5yefK0LBgjsNlTh2Z-k
 * 
 */
