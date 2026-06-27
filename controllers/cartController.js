import { prisma } from "../prisma/prisma.client.js";
import ApiError from "../utils/apiError.js";

// get cart
const getCart = async (req, res, next) => {
	const userId = req.userId;

	try {
		const cart = await prisma.cart.findUnique({
			where: { userId },
			include: { cartItems: true },
		});

		res.status(200).json({ status: "success", cart });
	} catch (err) {
		next(err);
	}
};

//add to cart
const addToCart = async (req, res, next) => {
	const { productId } = req.query;

	try {
		const product = await prisma.product.findUnique({
			where: { id: productId },
		});

		if (!product) {
			throw new ApiError("product not found", 404);
		}

		const user = await prisma.user.findUnique({
			where: { id: req.userId },
			select: {
				cart: {
					include: { cartItems: true },
				},
			},
		});

		for (const p in user.cart.cartItems) {
			if (user.cart.cartItems[p].productId === productId) {
				res.status(409).json({
					message: "product already in cart",
				});
				return;
			}
		}

		const cartItem = await prisma.cartItem.create({
			data: {
				cartId: user.cart.id,
				productId,
			},
		});

		const updatedCart = await prisma.cart.findUnique({
			where: { id: user.cart.id },
			include: { cartItems: true },
		});

		res.status(201).json({ status: "success", updatedCart });
	} catch (err) {
		next(err);
	}
};

// remove from cart

const removeFromCart = async (req, res, next) => {
	try {
		const userId = req.userId;
		const { productId } = req.query;

		const cart = await prisma.cart.findUnique({
			where: { userId },
			include: { cartItems: true },
		});

		for (const p in cart.cartItems) {
			if (cart.cartItems[p].productId === productId) {
				await prisma.cartItem.delete({
					where: { id: cart.cartItems[p].id },
				});

				res.status(200).json({
					status: "success",
					message: "Item has been removed from cart.",
				});
				return;
			}
		}

		res.status(404).json({
			status: "failed",
			message: "Item not in cart!",
		});
	} catch (err) {
		next(err);
	}
};

// update cart item
const updateCartItem = async (req, res, next) => {
	const { quantity, size, color, checkOut } = req.body;

	const { cartItemId } = req.query;

	try {
		const cartItem = await prisma.cartItem.update({
			where: { id: cartItemId },
			data: {
				quantity,
				size,
				color,
				checkOut,
			},
		});

		res.status(200).json({
			status: "success",
			message: "Cart Item updated",
		});
	} catch (err) {
		next(err);
	}
};

export { getCart, addToCart, removeFromCart, updateCartItem };
