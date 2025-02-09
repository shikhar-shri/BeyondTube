import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  changeUserAvatar,
  getUserWatchHistory,
  getUserChannelProfile,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").patch(verifyJWT, changeCurrentPassword);
router
  .route("/change-avatar")
  .patch(verifyJWT, upload.single("avatar"), changeUserAvatar);

router
  .route("/channels/channel/:username")
  .get(verifyJWT, getUserChannelProfile);

router.route("/watch-history").get(verifyJWT, getUserWatchHistory);

export default router;
