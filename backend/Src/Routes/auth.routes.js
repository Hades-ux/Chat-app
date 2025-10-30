import { Router } from "express";
import { loginUser, registerUser } from "../Controllers/auth.Controller.js";
import { upload } from "../Middlewares/multer.Middleware.js";

const router = Router();

router.post(
  "/register",
  upload.fields([{ name: "avatar", maxCount: 1 }]), // Multer middleware
  registerUser
);

router.route("/login").post( loginUser)


export default router; 