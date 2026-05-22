import express from "express";
import "dotenv/config";
import { prisma } from "./prisma/prisma.client.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
