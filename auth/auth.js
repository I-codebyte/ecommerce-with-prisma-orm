import jwt from "jsonwebtoken";
import "dotenv/config";

const authentication = async (req, res, next) => {
	const token = req.cookie.token;

	try {
		if (token.length <= 0) {
			res.status(403).json({ message: "not authenticated" });
		}

		const payload = jwt.verify(token, process.env.JWT_SECRET);

		const { userId } = payload;

		const user = await prisma.user.findUnique({
			where: { id: userId },
			omit: { password: true },
		});

		if (!user) {
			res.status(404).json({ message: "not authenticated" });
		}

		req.userId = userId;

		next();
	} catch (err) {
		res.status(err.statusCode).json({ message: err.message });
	}
};
