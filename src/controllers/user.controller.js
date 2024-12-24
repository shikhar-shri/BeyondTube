import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res, next) => {
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

  const { username, email, password, fullname } = req.body;
  //   console.log("username: ", username, "email: ", email);

  if (
    [username, email, password, fullname].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = User.findOne({
    $or: [{ username: username }, { email: email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);

  const coverImage = await uploadToCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Avatar file couldn't be uploaded");
  }

  //create() method creates and saves the doc in one step
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
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

export { registerUser };
