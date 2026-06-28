import express from "express";
import {
	allCat,
	createCat,
	// createMany,
	createProduct,
	deleteCat,
	deleteProduct,
	fetchAllProduct,
	fetchProductById,
	fetchProductOwnedByUser,
	fetchProductsByCategory,
	updateProduct,
} from "../controllers/productController.js";
import { authentication, authorization } from "../middleware/auth/auth.js";

const router = express.Router();

router.get("/products", fetchAllProduct);
router.get("/products/filter", fetchProductsByCategory);
// router.post("/products/createMany", createMany);   //this route is used for test purpose
router.post("/products", authentication, createProduct);
router.get("/products/:id", fetchProductById);
router.get("/products/user/all", authentication, fetchProductOwnedByUser);
router.put("/products/:id", authentication, updateProduct);
router.delete("/products/:id", authentication, deleteProduct);

// category route
router.get("/all_categories", allCat);
router.post("/create_category", authentication, authorization, createCat);
router.delete("/del_category", authentication, authorization, deleteCat);

export default router;
