import express from "express";
import {
	addToCart,
	getCart,
	removeFromCart,
	updateCartItem,
} from "../controllers/cartController.js";
import { authentication } from "../middleware/auth/auth.js";

const router = express.Router();

router.get("/cart", authentication, getCart);
router.post("/cart/update", authentication, updateCartItem);
router.post("/cart/add_to_cart", authentication, addToCart);
router.delete("/cart/remove_from_cart", authentication, removeFromCart);

export default router;
