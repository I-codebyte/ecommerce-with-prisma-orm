import jwt from "jsonwebtoken";
import "dotenv/config";
import ApiError from "../utils/apiError.js";
import { prisma } from "../prisma/prisma.client.js";

const authentication = async (req, res, next) => {
	const token = req.cookies.token;

	try {
		if (!token) {
			throw new ApiError("authentication needed", 403);
		}

		const payload = jwt.verify(token, process.env.JWT_SECRET);

		const { userId } = payload;

		const user = await prisma.user.findUnique({
			where: { id: userId },
			omit: { password: true },
		});

		if (!user) {
			throw new ApiError("authentication fail", 403);
		}

		req.userId = userId;

		next();
	} catch (err) {
		next(err);
	}
};

export { authentication };
