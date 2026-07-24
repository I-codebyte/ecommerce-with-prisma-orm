import express from "express";
import {
	addAddress,
	fetchUser,
	forgetPass,
	login,
	logout,
	register,
	resetPass,
	updateUser,
} from "../controllers/userController.js";
import { authentication } from "../middleware/auth/auth.js";

const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", authentication, logout);
router.get("/users/profile", authentication, fetchUser);
router.put("/users/profile", authentication, updateUser);
router.post("/forget-password", forgetPass);
router.post("/reset-password", resetPass);

// address routes
router.post("/users/address", authentication, addAddress);

export default router;
