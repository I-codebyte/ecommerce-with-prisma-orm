import express from "express";
import {
	createProduct,
	deleteProduct,
	fetchAllProduct,
	fetchProductById,
	fetchProductOwnedByUser,
	updateProduct,
} from "../controllers/productController.js";
import { authentication, authorization } from "../middleware/auth/auth.js";

const router = express.Router();

router.get("/products", fetchAllProduct);
router.post("/products", authentication, createProduct);
router.get("/products/:id", fetchProductById);
router.get("/products/user/all", authentication, fetchProductOwnedByUser)
router.put("/products/:id", authentication, updateProduct);
router.delete("/products/:id", authentication, deleteProduct);

export default router;
