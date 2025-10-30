import { Router } from "express";
import { authMiddleware } from "../Middlewares/jwt.Middleware.js";
import { upload } from "../Middlewares/multer.Middleware.js";
import {
  deleteUser,
  ownerProfile,
  UpdateUserAvatar,
  UpdateUserEmail,
  updateUserName,
  userProfile,
} from "../Controllers/user.controller.js";

const router = Router();

// upadte Avatar Image
router.patch(
  "/update-avatar/Image",
  authMiddleware,
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  UpdateUserAvatar
);

// user Profile
router.get("/user/profile", authMiddleware, userProfile);

// owner Profile
router.get("/owner/profile", authMiddleware, ownerProfile);

// update userName
router.patch("/update/userName", authMiddleware, updateUserName);

// update userEmail
router.patch("/update/userEmail", authMiddleware, UpdateUserEmail);

// update delete User
router.delete("/delete/user", authMiddleware, deleteUser);

export default router;
