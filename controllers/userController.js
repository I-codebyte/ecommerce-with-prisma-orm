import { prisma } from "../prisma/prisma.client.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/token.js";

const salt = bcrypt.genSalt(10);

const register = async (req, res) => {
	const { email, password, username } = req.body;

	try {
		const hashPassword = await bcrypt.hash(password, salt);

		const user = await prisma.user.create({
			data: { email, password: hashPassword, username },
			omit: { password: true },
		});

		res.status(201)
			.json(user)
			.cookie("token", generateToken(user.id), {
				maxAge: 60 * 60 * 1000,
			});
	} catch (err) {
		res.status(err.statusCode).json({ message: err.message });
	}
};

const login = async (req, res) => {
	const { email, password } = req.body;
	const token = req.cookie.token;

	if (token.length >= 1) {
		res.status(200).json({ message: "you're logged in" });
	}

	const user = await prisma.user.findUnique({
		where: { email },
	});

	const verifyPassword = await bcrypt.compare(password, user.password);

	try {
		if (!user && !password) {
			res.status(404).json({ message: "user not found" });
		}

		if (!verifyPassword) {
			res.status(400).json({
				message: "Authentication fail",
			});
		}

		const { password, ...authenticatedUser } = user;

		res.status(200)
			.json(authenticatedUser)
			.cookie("token", generateToken(user.id), {
				maxAge: 60 * 60 * 1000,
			});
	} catch (err) {
		res.status(err.statusCode).json({ message: err.message });
	}
};

const logout = async (req, res) => {
	const token = req.cookie.token;

	try {
		if (token.length <= 0) {
			res.status(200).json({ message: "you're logged out" });
		}

		res.clearCookie("token")
			.status(200)
			.json({ message: "logged out successfully" });
	} catch (err) {
		res.status(err.statusCode).json({ message: err.message });
	}
};

export { register, login, logout };
