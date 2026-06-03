import express from "express";
import { getOrders } from "../controllers/orderController.js";
import { authentication } from "../middleware/auth/auth.js";

const router = express.Router();

router.get("/orders",authentication, getOrders);

export default router;
