import { prisma } from "../prisma/prisma.client.js";
import ApiError from "../utils/apiError.js";

//retrieve all posts
const fetchAllProduct = async (req, res, next) => {
	const products = await prisma.product.findMany();

	try {
		res.status(200).json({
			status: "success",
			totalProducts: products.length,
			products,
		});
	} catch (err) {
		next(err);
	}
};

//create product
const createProduct = async (req, res, next) => {
	const { name, description, price, stock, image_url, size, color } =
		req.body;

	const userId = req.userId;

	if (!name) {
		throw new ApiError("Name is required", 403);
	}

	if (!price) {
		throw new ApiError("Price is required", 403);
	}

	if (!description) {
		throw new ApiError("Description is required", 403);
	}

	if (!image_url) {
		throw new ApiError("Image is required", 403);
	}

	try {
		const product = await prisma.product.create({
			data: {
				name,
				description,
				price,
				stock,
				image_url,
				size,
				color,
				userId,
			},
		});

		res.status(201).json(product);
	} catch (err) {
		next(err);
	}
};

//retrieve product by id
const fetchProductById = async (req, res, next) => {
	const id = req.params.id;

	const product = await prisma.product.findUnique({ where: { id } });

	try {
		if (!product) {
			return res.status(404).json({
				status: "failed",
				message: "Product not found!",
			});
		}

		res.status(200).json({ status: "success", product });
	} catch (err) {
		next(err);
	}
};

//update product
const updateProduct = async (req, res, next) => {
	const { name, description, price, stock, image_url, size, color } =
		req.body;
	const id = req.params.id;

	const userId = req.userId;

	const product = await prisma.product.findUnique({ where: { id } });

	try {
		if (product) {
			if (userId !== product.userId) {
				throw new ApiError("Unauthorized", 403);
			}
			await prisma.product.update({
				where: { id },
				data: {
					name,
					description,
					price,
					stock,
					image_url,
					size,
					color,
				},
			});

			res.status(200).json({
				status: "success",
				message: "Product updated",
			});
			return;
		}

		res.status(404).json({
			status: "failed",
			message: "Product not found!",
		});
	} catch (err) {
		next(err);
	}
};

// delete a product
const deleteProduct = async (req, res, nex) => {
	const id = req.params.id;
	const userId = req.userId;

	try {
		if (!id) {
			throw new ApiError("invalid endpoint", 400);
		}

		const product = await prisma.product.findUnique({
			where: { id },
		});

		if (userId !== product.userId) {
			throw new ApiError("Unautorized", 401);
		}

		if (!product) {
			throw new ApiError("product does not exist!", 404);
		}

		await prisma.product.delete({ where: { id } });

		res.status(200).json({
			status: "success",
			message: "Product deleted",
		});
	} catch (err) {
		next(err);
	}
};

export {
	fetchAllProduct,
	createProduct,
	fetchProductById,
	updateProduct,
	deleteProduct,
};
