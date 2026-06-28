import { prisma } from "../prisma/prisma.client.js";
import ApiError from "../utils/apiError.js";

//retrieve all products
const fetchAllProduct = async (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 3;

		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;

		const products = await prisma.product.findMany({
			skip: startIndex,
			take: limit,
		});

		const productCount = await prisma.product.count();

		res.status(200).json({
			status: "success",
			totalPages: Math.ceil(productCount / limit),
			currentPage: page,
			previousPage:
				startIndex > 0
					? {
							page: page - 1,
							limit,
							url: `http://localhost:4600/api/v1/products?page=${page - 1}&limit=${limit}`,
						}
					: null,
			nextPage:
				endIndex < productCount
					? {
							page: page + 1,
							limit,
							url: `http://localhost:4600/api/v1/products?page=${page + 1}&limit=${limit}`,
						}
					: null,
			totalProducts: productCount,
			products,
		});
	} catch (err) {
		next(err);
	}
};

// retrieve products by category
const fetchProductsByCategory = async (req, res, next) => {
	try {
		const category = req.query.category;
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 3;

		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;

		const products = await prisma.product.findMany({
			where: {
				categories: {
					has: category,
				},
			},
			skip: startIndex,
			take: limit,
		});

		const productCount = await prisma.product.count({
			where: {
				categories: { has: category },
			},
		});

		res.status(200).json({
			status: "success",
			totalPages: Math.ceil(productCount / limit),
			currentPage: page,
			previousPage:
				startIndex > 0
					? {
							page: page - 1,
							limit,
							url: `http://localhost:4600/api/v1/products?page=${page - 1}&limit=${limit}`,
						}
					: null,
			nextPage:
				endIndex < productCount
					? {
							page: page + 1,
							limit,
							url: `http://localhost:4600/api/v1/products?page=${page + 1}&limit=${limit}`,
						}
					: null,
			totalProducts: productCount,
			products,
		});
	} catch (err) {
		next(err);
	}
};

//create product
const createProduct = async (req, res, next) => {
	const {
		name,
		description,
		price,
		stock,
		imageUrl,
		size,
		color,
		categories,
	} = req.body;

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

	if (!imageUrl) {
		throw new ApiError("Image is required", 403);
	}
	if (!categories) {
		throw new ApiError("Category is required", 403);
	}

	try {
		const product = await prisma.product.create({
			data: {
				name,
				description,
				price,
				stock,
				imageUrl,
				size,
				color,
				userId,
				categories,
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

// fetch product created by a user
const fetchProductOwnedByUser = async (req, res, next) => {
	const userId = req.userId;

	try {
		const products = await prisma.product.findMany({
			where: { userId },
		});

		res.status(200).json({
			status: "success",
			count: products.length,
			products,
		});
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

// create category
const createCat = async (req, res, next) => {
	try {
		const { name } = req.body;

		const existingCat = await prisma.category.findUnique({
			where: { name },
		});

		if (existingCat) {
			res.status(409).json({
				status: "success",
				message: `A category ${name} already exist!`,
			});
			return;
		}

		const category = await prisma.category.create({
			data: { name },
		});

		res.status(201).json({ status: "success", category });
	} catch (err) {
		next(err);
	}
};

// retrieve all category
const allCat = async (req, res, next) => {
	try {
		const categories = await prisma.category.findMany();

		res.status(200).json({
			status: "success",
			count: categories.length,
			categories,
		});
	} catch (err) {
		next(err);
	}
};

// delete category
const deleteCat = async (req, res, next) => {
	try {
		const { category } = req.query;

		const searchCategory = await prisma.category.findUnique({
			where: { name: category },
		});

		if (!searchCategory) {
			res.status(404).json({
				status: "success",
				message: `Category not found!`,
			});
		}

		await prisma.category.delete({
			where: { name: category },
		});

		res.status(200).json({
			status: "success",
			message: `${category} deleted!`,
		});
	} catch (err) {
		next(err);
	}
};

// create many. // this is used for test purpose
// const createMany = async (req, res, next) => {
// 	try {
// 		const data = req.body;

// 		const createData = await prisma.product.createMany({
// 			data: data,
// 		});

// 		res.status(200).json({ status: "success", data: createData });
// 	} catch (err) {
// 		next(err);
// 	}
// };

export {
	fetchAllProduct,
	createProduct,
	fetchProductById,
	updateProduct,
	deleteProduct,
	fetchProductOwnedByUser,
	fetchProductsByCategory,
	createCat,
	deleteCat,
	allCat,
	// createMany,
};
