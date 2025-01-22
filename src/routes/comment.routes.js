import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createAComment,
  deleteAComment,
  getCommentsByVideoId,
  getRepliesOfAComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/:videoId/create-comment").post(createAComment);
router.route("/:videoId/get-comments").get(getCommentsByVideoId);
router
  .route("/:videoId/:parentCommentId/get-replies")
  .get(getRepliesOfAComment);
router.route("/:videoId/delete-comment/:commentId").delete(deleteAComment);

export default router;
