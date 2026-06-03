import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import orderRouter from "./routes/orderRoute.js";
import { prisma } from "./prisma/prisma.client.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//user routes
app.use("/api/v1", userRouter);

// product routes
app.use("/api/v1", productRouter);

// order routes
app.use("/api/v1", orderRouter);

const port = process.env.PORT || 5000;

app.use((err, req, res, next) => {
	err.status = err.status || "Error";
	err.statusCode = err.statusCode || 500;
	err.message = err.message || "server error";
	console.log(err.stack);

	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
	});
});

app.listen(port, () => console.log(`server is running on port: ${port}`));

// graceful shutdown
process.on("SIGINT", async () => {
	console.log(`received SIGINT`);
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log(`received SIGTERM`);
	process.exit(0);
});
