import express from "express";
import {
	fetchUser,
	login,
	logout,
	register,
	updateUser,
} from "../controllers/userController.js";
import { authentication } from "../middleware/auth/auth.js";

const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", authentication, logout);
router.get("/users/profile", authentication, fetchUser);
router.put("/users/profile", authentication, updateUser);

export default router;
