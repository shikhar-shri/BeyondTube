import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addLikeOrDislike } from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/:entityType/:entityId").put(addLikeOrDislike);

export default router;
