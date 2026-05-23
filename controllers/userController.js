import { prisma } from "../prisma/prisma.client.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/token.js";
import ApiError from "../utils/apiError.js";

const salt = await bcrypt.genSalt(10);

const register = async (req, res, next) => {
	const { email, password, username } = req.body;

	const existingEmail = await prisma.user.findUnique({
		where: { email },
	});

	const existingUsername = await prisma.user.findUnique({
		where: { username },
	});

	try {
		if (existingEmail) {
			throw new ApiError("email has been used", 403);
		}

		if (existingUsername) {
			throw new ApiError("username has been used", 403);
		}

		const hashPassword = await bcrypt.hash(password, salt);

		const user = await prisma.user.create({
			data: { email, password: hashPassword, username },
			omit: { password: true },
		});

		res.cookie("token", generateToken(user.id), {
			maxAge: 60 * 60 * 1000,
		})
			.status(201)
			.json(user);
	} catch (err) {
		next(err);
	}
};

const login = async (req, res, next) => {
	const { email, password } = req.body;
	const token = req.cookies.token;

	if (token) {
		throw new ApiError("you're logged in", 304);
	}

	const user = await prisma.user.findUnique({
		where: { email },
	});

	try {
		if (!user) {
			throw new ApiError("user not found", 404);
		}

		if (!password) {
			throw new ApiError("no password", 403);
		}

		const verifyPassword = await bcrypt.compare(
			password,
			user.password,
		);

		if (!verifyPassword) {
			throw new ApiError("incorrect password", 400);
		}

		res.cookie("token", generateToken(user.id), {
			maxAge: 60 * 60 * 1000,
		})
			.status(200)
			.json({
				message: "login successful",
			});
	} catch (err) {
		next(err);
	}
};

const logout = async (req, res, next) => {
	res.clearCookie("token")
		.status(200)
		.json({ message: "logged out successfully" });
};

const fetchUser = async (req, res, next) => {
	const userId = req.userId;

	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			omit: { password: true },
		});

		res.status(200).json(user);
	} catch (err) {
		next(err);
	}
};

const updateUser = async (req, res, next) => {
	const { email, username, oldPassword, newPassword } = req.body;
	const userId = req.userId;
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (email || username) {
			await prisma.user.update({
				where: { email: user.email },
				data: {
					email: email || undefined,
					username: username || undefined,
				},
			});
		}

		if (oldPassword && newPassword) {
			const verifyPassword = await bcrypt.compare(
				oldPassword,
				user.password,
			);

			if (!verifyPassword) {
				throw new ApiError("incorrect password");
			}

			const hashPassword = await bcrypt.hash(
				newPassword,
				salt,
			);

			await prisma.user.update({
				where: { email: user.email },
				data: { password: hashPassword },
			});

			res.clearCookie("token");

			// res.status(200).json({ message: "profile updated." }); //add redirect to login
			// return;
		}

		res.status(200).json({ message: "profile updated" });
	} catch (err) {
		next(err);
	}
};

export { register, login, logout, fetchUser, updateUser };
