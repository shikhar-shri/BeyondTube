import mongoose, { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

/**
 *
 * these schemas contains the following info about
 * a like/dislike:
 * 1. videoId and UserId
 * 2. commentId and UserId
 * 3. string type, which can be either "like" or "dislike"
 *
 */

const videoLikeSchema = new Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },
    likedOrDislikedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },
  },
  { timestamps: true }
);

const commentLikeSchema = new Schema(
  {
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
      index: true,
    },
    likedOrDislikedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },
  },
  { timestamps: true }
);

//Ensure a user can only like or dislike a particular video or comment once by creating a compound index.
videoLikeSchema.index({ video: 1, likedOrDislikedBy: 1 }, { unique: true });
commentLikeSchema.index({ comment: 1, likedOrDislikedBy: 1 }, { unique: true });

export const VideoLike = new model("VideoLike", videoLikeSchema);
export const CommentLike = new model("CommentLike", commentLikeSchema);
