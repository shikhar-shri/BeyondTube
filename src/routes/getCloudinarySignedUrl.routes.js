import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getCloudinarySignedUrl } from "../controllers/getCloudinarySignedUrl.controller.js";

const router = Router();

router.route("/").get(verifyJWT, getCloudinarySignedUrl);

export default router;
