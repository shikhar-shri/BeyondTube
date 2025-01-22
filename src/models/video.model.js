import mongoose, { Schema, model } from "mongoose";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, //cloudinary
      required: true,
    },

    thumbnail: {
      type: String,
      required: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    title: {
      type: String,
      required: true,
      index: true, //creating an index on the title field for efficient searching
    },

    description: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    dislikesCount: {
      type: Number,
      default: 0,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Video = new model("Video", videoSchema);
