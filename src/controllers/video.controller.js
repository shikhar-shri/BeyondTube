import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/apiErrors.js";

import mongoose from "mongoose";

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
      $regex: searchQuery,
      $options: "i",
    };
  }

  // const videos = await Video.find(query)
  //   .sort({
  //     [sortBy]: sortType,
  //   })
  //   .skip((pageNum - 1) * limitNum)
  //   .limit(limitNum);

  const videos = await Video.aggregate([
    {
      $match: query,
    },
    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    },
    {
      $skip: (pageNum - 1) * limitNum,
    },
    {
      $limit: limitNum, //till this point we have all the video documents along with the owner id
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner", //to get the owner object instead of an array
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        thumbnail: 1,
        videoFile: 1,
        views: 1,
        likes: 1,
        createdAt: 1,
        owner: {
          username: "$owner.username",
          fullName: "$owner.fullname",
          avatar: "$owner.avatar",
        },
      },
    },
  ]);

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
  1. Client sends a get request to get signed url from cloudinary.
  2. Server sends a response with signed url.
  3. Client uploads video directly to cloudinary using signed url.
  4. Client sends a post request to server with video metadata returned by cloudinary as response.
  */

  const { title, description, videoUrl, videoDuration } = req.body;
  if (!title) {
    throw new ApiError(400, "Title is required");
  }

  if (!description) {
    throw new ApiError(400, "Description is required");
  }

  if (!videoUrl) {
    throw new ApiError(400, "Video URL is required");
  }

  if (!videoDuration) {
    throw new ApiError(400, "Video duration is required");
  }

  console.log("Video URL ", videoUrl);
  console.log("Video Duration ", videoDuration);

  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  console.log("Thumbnail Local Path", thumbnailLocalPath);

  const thumbnail = await uploadToCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    throw new ApiError(500, "Error uploading thumbnail to cloudinary");
  }

  // save video to database
  const uploadedVideo = await Video.create({
    videoFile: videoUrl,
    thumbnail: thumbnail.url,
    owner: req.user?._id,
    title,
    description,
    duration: Number(videoDuration),
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { video: uploadedVideo },
        "Video metadata stored in database successfully"
      )
    );
});

const getVideosUploadedByUser = asyncHandler(async (req, res) => {
  /*
  1. get the user._id from the request object via auth middleware
  2. get all the videos uploaded by the user from videos collection
  */
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortType = "desc",
    searchQuery,
  } = req.query;

  // console.log(searchQuery);

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  //making the query object
  const query = {};
  if (searchQuery) {
    query.title = {
      $regex: searchQuery,
      $options: "i",
    };
  }

  query.owner = req.user?._id;

  const myVideos = await Video.aggregate([
    {
      $match: query,
    },
    {
      $sort: {
        [sortBy]: sortType == "desc" ? -1 : 1,
      },
    },
    {
      $skip: (pageNum - 1) * limitNum,
    },
    {
      $limit: limitNum, // here we have the paginated output videos matching the owner and search title
    },
  ]);

  // console.log(myVideos[0]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        myVideos,
        "Videos uploaded by the user fetched successfully!!"
      )
    );
});

const updateVideoDetails = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // console.log("Video ID: ", videoId);
  if (!videoId) {
    throw new ApiError(400, "Video ID is missing");
  }

  const _videoId = new mongoose.Types.ObjectId(String(videoId));

  if (!(await Video.findById(_videoId))) {
    throw new ApiError(404, "Video not found");
  }

  /*

  1. get updated title, description, thumbnail from request body
  2. update the video document in the database
  
  */
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  const thumbnail = null;

  if (thumbnailLocalPath) {
    thumbnail = await uploadToCloudinary(thumbnailLocalPath);
    if (!thumbnail) {
      throw new ApiError(500, "Error uploading thumbnail to cloudinary");
    }
  }

  const updatedFields = {};
  if (title) {
    updatedFields.title = title;
  }
  if (description) {
    updatedFields.description = description;
  }
  if (thumbnail) {
    updatedFields.thumbnail = thumbnail.url;
  }

  const video = await Video.findByIdAndUpdate(
    _videoId,
    {
      $set: updatedFields,
    },
    { new: true, runValidators: true }
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedVideoDetails: video },
        "Video details updated successfully"
      )
    );
});

//TODO: Implement this function after comments, likes, dislikes models are created
const getVideoDetailsById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video ID is missing");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  /*
  todo:
  1. increment the views count of the video
  2. get the comments, likes, dislikes of the video
  3. get the owner details of the video like username, avatar, subscribers count
  
  */
});

export {
  getAllVideos,
  publishAVideo,
  updateVideoDetails,
  getVideoDetailsById,
  getVideosUploadedByUser,
};
