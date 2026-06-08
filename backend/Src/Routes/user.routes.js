import { Router } from "express";
import { authMiddleware } from "../Middlewares/jwt.Middleware.js";
import { upload } from "../Middlewares/multer.Middleware.js";
import { validationMiddleware } from "../Middlewares/validation.Middleware.js";
import {
  deleteUser,
  ownerProfile,
  sendChangeEmail,
  UpdateUserAvatar,
  UpdateUserEmail,
  updateUserName,
  userProfile,
} from "../Controllers/user.controller.js";
import {
  changeEmailValidation,
  sendChangeEmailValidation,
} from "../validation/user.validation.js";

const router = Router();

// upadte Avatar Image
router.patch(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  UpdateUserAvatar
);

// user Profile
router.get("/profile/:id", authMiddleware, userProfile);

// owner Profile
router.get("/profile", authMiddleware, ownerProfile);

// update userName
// router.patch("/update/userName", authMiddleware, updateUserName);

//send changeEmail
router.post(
  "/email/change-request",
  authMiddleware,
  sendChangeEmailValidation,
  validationMiddleware,
  sendChangeEmail
);

// update userEmail
router.patch(
  "/email",
  authMiddleware,
  changeEmailValidation,
  validationMiddleware,
  UpdateUserEmail
);

//delete User
router.delete("/user", authMiddleware, deleteUser);

export default router;
