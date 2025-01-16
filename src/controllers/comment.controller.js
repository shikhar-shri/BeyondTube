import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apiErrors.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const createAComment = asyncHandler(async (req, res) => {
  /*
    fetch user_id from req.user (auth middleware)
    1. fetch {content, parentCommentId} from req.body
    2. fetch video_id from req.params
    3. save the comment in the comment collection
    
    */

  const { content, parentCommentId } = req.body;
  const { videoId } = req.params;

  if (!(await Video.findById(new mongoose.Types.ObjectId(String(videoId))))) {
    throw new ApiError(404, "Video not found!!");
  }

  if (!content) {
    throw new ApiError(400, "Content is required!!");
  }

  if (!videoId) {
    throw new ApiError(400, "Video ID is required!!");
  }

  /*
    parentCommentId will be null for top-level comments.
    For replies on an existing comment, parentCommentId will be the id of the already existing comment.
  */

  const createdComment = await Comment.create({
    content,
    video: new mongoose.Types.ObjectId(String(videoId)),
    owner: req.user._id,
    parentComment: parentCommentId
      ? new mongoose.Types.ObjectId(String(parentCommentId))
      : null,
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, createdComment, "Comment created successfully!!")
    );
});

const deleteAComment = asyncHandler(async (req, res) => {
  /*
        1. Only the comment owner or the video owner can delete a particular comment
        2. Deleting a comment should also delete all its replies also
    
    */

  const { videoId, commentId } = req.params;
  if (!videoId) throw new ApiError(400, "Video ID is required!!");
  if (!commentId) throw new ApiError(400, "Comment ID is required!!");

  const comment = await Comment.findById(
    new mongoose.Types.ObjectId(String(commentId))
  );

  const video = await Video.findById(
    new mongoose.Types.ObjectId(String(videoId))
  );

  if (!video) throw new ApiError(404, "Video not found!!");

  if (!comment) throw new ApiError(404, "Comment not found!!");

  if (
    String(req.user?._id) === String(comment.owner) ||
    String(req.user?._id) === String(video.owner)
  ) {
    await Comment.deleteMany({
      $or: [
        { _id: new mongoose.Types.ObjectId(String(commentId)) },
        { parentComment: new mongoose.Types.ObjectId(String(commentId)) },
      ],
    });

    res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment deleted successfully!!"));
  } else
    throw new ApiError(403, "You are not authorized to delete this comment!!");
});

const getCommentsByVideoId = asyncHandler(async (req, res) => {
  /*
   fetch all the top level comments:
   1. get videoId from req.params
   2. get all the comments from comments collection for the particular videoId where parentCommentId is null
   */

  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Video ID is required!!");

  if (!(await Video.findById(new mongoose.Types.ObjectId(String(videoId)))))
    throw new ApiError(404, "Video not found!!");

  const topLevelComments = await Comment.find({
    video: new mongoose.Types.ObjectId(String(videoId)),
    parentComment: null,
  })
    .sort({ createdAt: 1 })
    .populate("owner", "username avatar");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comments: topLevelComments },
        "Comments fetched successfully"
      )
    );
});

const getRepliesOfAComment = asyncHandler(async (req, res) => {
  /*
        1. fetch parent comment id from req.params
        2. fetch all the comments from comments collection matching the parent comment id.
        3. sort the comments in ascending order of creation date
     */

  const { parentCommentId } = req.params;
  if (!parentCommentId)
    throw new ApiError(400, "Parent Comment Id is required!!");

  if (
    !(await Comment.findById(
      new mongoose.Types.ObjectId(String(parentCommentId))
    ))
  )
    throw new ApiError(404, "No such comment exists!");

  const replies = await Comment.find({
    parentComment: new mongoose.Types.ObjectId(String(parentCommentId)),
  })
    .sort({ createdAt: 1 })
    .populate("owner", "username avatar");

  res
    .status(200)
    .json(new ApiResponse(200, replies, "Replies fetched successfully!!"));
});

export {
  createAComment,
  deleteAComment,
  getCommentsByVideoId,
  getRepliesOfAComment,
};
