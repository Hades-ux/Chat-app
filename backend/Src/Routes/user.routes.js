import { Router } from "express";
import { authMiddleware } from "../Middlewares/jwt.Middleware.js";
import { upload } from "../Middlewares/multer.Middleware.js";
import {
  deleteUser,
  ownerProfile,
  UpdateUserAvatar,
  UpdateUserEmail,
  updateUserName,
  userOnline,
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
router.get("/profile", authMiddleware, userProfile);

// owner Profile
router.get("/owner/profile", authMiddleware, ownerProfile);

// update userName
router.patch("/update/userName", authMiddleware, updateUserName);

// update userEmail
router.patch("/update/userEmail", authMiddleware, UpdateUserEmail);

// update delete User
router.delete("/delete/user", authMiddleware, deleteUser);

// userOnline
router.get("/online/:id", userOnline)
export default router;
