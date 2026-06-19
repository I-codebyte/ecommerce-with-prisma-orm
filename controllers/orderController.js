import { prisma } from "../prisma/prisma.client.js";
import ApiError from "../utils/apiError.js";

// Retrieve orders for a customer
const getOrders = async (req, res, next) => {
	try {
		const userId = req.userId;
		const orders = await prisma.order.findMany({
			where: { buyerId: userId },
			include: { orderItems: true },
		});
		res.status(200).json(orders);
	} catch (err) {
		next(err);
	}
};

// create order
const createOrder = async (req, res, next) => {
	const userId = req.userId;

	const user = await prisma.user.findUnique({
		where: { id: userId },
		omit: { password: true },
		include: {
			address: true,
			cart: {
				include: {
					cartItems: {
						where: { checkOut: true },
						omit: { cartId: true },
					},
				},
			},
		},
	});

	if (!user.cart.cartItems.length) {
		return res.status(404).json({
			status: "failed",
			message: "Cart is empthy!",
		});
	}

	const { shipping_fee } = req.body;

	const addressId = user.address.find((a) => {
		return a.is_default === true;
	}).id;

	try {
		const order = await prisma.$transaction(async (tx) => {
			let sortItems = [];
			let sub_total = 0;

			const checkOutItems = user.cart.cartItems;

			const productIds = checkOutItems.map(
				(item) => item.productId,
			);

			const products = await tx.product.findMany({
				where: { id: { in: productIds } },
			});

			checkOutItems.forEach((item) => {
				for (let pID of products) {
					if (pID.id === item.productId) {
						sub_total =
							sub_total +
							pID.price *
								item.quantity;
					}
				}

				tx.product.update({
					where: { id: item.productId },
					data: {
						stock: {
							decrement: item.quantity,
						},
					},
				});

				const { checkOut, ...filteredItem } = item;
				sortItems.push(filteredItem);
			});

			const total_amount = shipping_fee + sub_total;

			const order = await tx.order.create({
				data: {
					buyerId: userId,
					shipping_fee,
					sub_total,
					total_amount,
					addressId,
					orderItems: {
						createMany: {
							data: sortItems,
						},
					},
				},
				include: { orderItems: true },
			});

			await tx.cartItem.deleteMany({
				where: {
					productId: { in: productIds },
					checkOut: true,
				},
			});

			return order;
		});

		res.status(201).json({ status: "success", order });
	} catch (err) {
		next(err);
	}
};

export { getOrders, createOrder };
