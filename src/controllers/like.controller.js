import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CommentLike, VideoLike } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";

const addLikeOrDislike = asyncHandler(async (req, res) => {
  const { entityId, entityType } = req.params;
  const { interaction } = req.body;
  /*
    interaction->like/dislike,
    entityType->video/comment,
    entityId->videoId/commentId
  */

  if (!entityId || !entityType || !interaction) {
    throw new ApiError(
      400,
      "All fields (entityId, entityType, interaction ) are required"
    );
  }

  if (!["like", "dislike"].includes(interaction)) {
    throw new ApiError(400, "Invalid interaction type");
  }

  if (!["video", "comment"].includes(entityType)) {
    throw new ApiError(400, "Invalid entity type");
  }

  const LikeModel = entityType === "video" ? VideoLike : CommentLike;
  const EntityModel = entityType === "video" ? Video : Comment;

  const entity = await EntityModel.findById(entityId);

  if (!entity) {
    throw new ApiError(404, `${entityType} not found`);
  }

  /*
  1. create like/dislike for the requested entity
  2. update the like/dislike count for the requested entity 
  */

  /*
   increment the like/dislike count for the particular entity:

   1. check if the user has already liked/disliked the entity
   2. if yes then don't increment the count.
   3. if no then increment the respective count of like or dislike for the entity

   Model.updateOne({ filter }, { $inc: { fieldName: incrementValue } });

  */

  const existingInteraction = await LikeModel.findOne({
    likedOrDislikedBy: req.user?._id,
    [entityType]: entityId,
  });

  let updatedCount = {};

  if (!existingInteraction) {
    //user has not previously liked/disliked the entity
    console.log("User has not previously liked/disliked the entity");

    updatedCount[`${interaction}sCount`] = 1;
  } else if (existingInteraction.type !== interaction) {
    // console.log("User has previously liked/disliked the entity");

    //user is trying to switch the like/dislike

    /*
        case1:
        type->like
        interaction->dislike

        case2:
        type->dislike
        interaction->like


    */
    updatedCount[`${interaction}sCount`] = 1;
    updatedCount[`${existingInteraction.type}sCount`] = -1;
  }

  let updatedEntity = {};
  if (Object.keys(updatedCount).length !== 0) {
    console.log("Updating the entity");

    updatedEntity = await EntityModel.findByIdAndUpdate(
      entityId,
      {
        $inc: updatedCount,
      },
      { new: true }
    );
  }

  /*
    Also handles the case if user already liked a video and now he is disliking it or vice-versa

  */
  const savedInteraction = await LikeModel.findOneAndUpdate(
    //search criteria
    {
      likedOrDislikedBy: req.user?._id,
      [entityType]: entityId,
    },

    //data to update/create
    {
      likedOrDislikedBy: req.user?._id,
      [entityType]: entityId,
      type: interaction,
    },

    {
      upsert: true, //create if document doesn't exist
      new: true,
    }
  );

  const updatedEntityMessage = res.status(200).json(
    new ApiResponse(
      200,
      {
        savedInteraction: savedInteraction,
        [`updated ${entityType}`]:
          Object.keys(updatedEntity).length > 0 ? updatedEntity : entity,
      },
      "Interaction updated successfully"
    )
  );
});

export { addLikeOrDislike };
