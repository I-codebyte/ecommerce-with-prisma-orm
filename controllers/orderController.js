import { prisma } from "../prisma/prisma.client.js";

// Retrieve orders for a customer
const getOrders = async (req, res, next) => {
	try {
		const userId = req.userId;
		const orders = await prisma.order.findMany({
			where: { userId },
		});
		res.status(200).json(orders);
	} catch (err) {
		next(err);
	}
};

// create order
const createOrder = async (req, res, next)=>{
    
}

export { getOrders };
