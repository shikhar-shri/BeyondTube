import mongoose, { Schema, model } from "mongoose";

const subscriptionSchema = new Schema(
  {
    channel: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    subscriber: {
      type: Schema.Types.ObjectId, //subscriber subscribes to channel
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = new model("Subscription", subscriptionSchema);
