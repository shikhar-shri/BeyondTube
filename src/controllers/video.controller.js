import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortType = "desc",
    searchQuery,
  } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const query = {};
  if (searchQuery) {
    query.title = {
      title: { $regex: searchQuery, $options: "i" },
    };
  }

  const videos = await Video.find(query)
    .sort({
      [sortBy]: sortType,
    })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos: videos, page: pageNum, limit: limitNum },
        "All videos fetched successfully"
      )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video
  /*
  check for the video's title and description in the request body first.
  1. get video and video details from req.body and req.files object.
  2. upload it to cloudinary.
  3. save the cloudinary url and duration in the videos collection
  */

  const { title, description } = req.body;
  if (!title) {
    throw new ApiError(400, "Title is required");
  }

  if (!description) {
    throw new ApiError(400, "Description is required");
  }

  const videoLocalPath = req.files?.video?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video is required");
  }

  console.log("Video Local Path", videoLocalPath);

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  console.log("Thumbnail Local Path", thumbnailLocalPath);

  // upload video and thumbnail to cloudinary
  const video = await uploadToCloudinary(videoLocalPath);
  if (!video) {
    throw new ApiError(500, "Error uploading video to cloudinary");
  }

  const thumbnail = await uploadToCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    throw new ApiError(500, "Error uploading thumbnail to cloudinary");
  }

  // save video to database
  const uploadedVideo = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    owner: req.user?._id,
    title,
    description,
    duration: video.duration,
  });
});

export { getAllVideos, publishAVideo };
