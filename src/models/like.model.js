import mongoose, { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

/**
 *
 * this schema contains the following info about
 * a like/dislike:
 * 1. video to which like/dislke has been made
 * 2. comment(of a video) to which like/dislike has been made
 * 3. user which liked/dislked the video/comment
 *
 */

const likeSchema = new Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },

    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },

    type: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },
  },
  { timestamps: true }
);

export const Like = new model("Like", likeSchema);
