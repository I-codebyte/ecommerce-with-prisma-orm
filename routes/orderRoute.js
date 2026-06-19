import express from "express";
import { createOrder, getOrders } from "../controllers/orderController.js";
import { authentication } from "../middleware/auth/auth.js";

const router = express.Router();

router.get("/orders",authentication, getOrders);
router.post("/orders/create", authentication, createOrder)

export default router;
