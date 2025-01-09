import mongoose, { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

/**
 *
 * this schema contains the following info about
 * a comment:
 * 1. content of the comment
 * 2. video on which the comment has been made
 * 3. user which made the comment
 * 4. parentComment in case the user has replied to a comment which has been already made
 *
 */

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },

    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    dislikeCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

commentSchema.plugin(mongooseAggregatePaginate);
export const Comment = new model("Comment", commentSchema);
