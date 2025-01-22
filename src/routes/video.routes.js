import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllVideos,
  publishAVideo,
  updateVideoDetails,
  getVideosUploadedByUser,
} from "../controllers/video.controller.js";

import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/home").get(getAllVideos);
router.route("/publish").post(upload.single("thumbnail"), publishAVideo);
router
  .route("/video/:videoId/update")
  .patch(upload.single("thumbnail"), updateVideoDetails);

router.route("/my-videos").get(getVideosUploadedByUser);
// router.route("/video/:videoId").get(getVideoDetailsById);

export default router;
