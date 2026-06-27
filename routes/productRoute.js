import express from "express";
import {
	allCat,
	createCat,
	createProduct,
	deleteCat,
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

// category route
router.get("/all_categories", allCat)
router.post("/create_category", authentication, authorization, createCat)
router.delete("/del_category", authentication, authorization, deleteCat)

export default router;
