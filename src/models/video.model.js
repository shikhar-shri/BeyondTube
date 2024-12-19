import mongoose, { Schema, Model } from "mongoose";

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
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Video = new Model("Video", videoSchema);
