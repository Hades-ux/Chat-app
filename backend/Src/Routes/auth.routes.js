import { Router } from "express";
import { registerUser } from "../Controllers/auth.Controller.js";

const router = Router();

router.route("/register").post(registerUser);

export default router; 