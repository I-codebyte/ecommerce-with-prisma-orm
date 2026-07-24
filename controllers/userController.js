import { prisma } from "../prisma/prisma.client.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/token.js";
import ApiError from "../utils/apiError.js";
import { modifier, passValidator, transporter } from "../utils/helper.js";
import jwt from "jsonwebtoken";

const salt = await bcrypt.genSalt(10);

// register user
const register = async (req, res, next) => {
	let { firstName, lastName, email, password } = req.body;

	const token = req.cookies.token;

	// gmail validation string
	const mailV = /^\w+@\w+\.\w+$/;

	try {
		// if user is logged in redirect to home
		if (token) {
			res.redirect("/api/v1/users/profile");
			return;
		}

		if (!email || !password || !firstName || !lastName) {
			throw new ApiError("All inputs are required!", 403);
		}

		if (!mailV.test(email)) {
			res.status(403).json({
				message: `${email} is not a valid email address!`,
			});

			return;
		}

		firstName = modifier(firstName);
		lastName = modifier(lastName);
		email = email.trim().toLowerCase();

		const passErrMsg = passValidator(password);

		if (passErrMsg.length === 0) {
			res.status(403).json({
				message: passErrMsg,
			});

			return;
		}

		const existingEmail = await prisma.user.findUnique({
			where: { email },
		});

		if (existingEmail) {
			throw new ApiError("email has been used", 403);
		}
		const hashPassword = await bcrypt.hash(password, salt);

		const user = await prisma.user.create({
			data: {
				firstName,
				lastName,
				email,
				password: hashPassword,
				cart: {
					create: {},
				},
			},
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

// login
const login = async (req, res, next) => {
	let { email, password } = req.body;

	email = email.trim().toLowerCase();

	const token = req.cookies.token;

	if (token) {
		throw new ApiError("you're logged in", 304);
	}

	if (!email) {
		throw new ApiError("Email field cannot be empty", 403);
	}

	if (!password) {
		throw new ApiError("Password field cannot be empty", 403);
	}

	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		throw new ApiError("user not found", 404);
	}

	if (!password) {
		throw new ApiError("no password", 403);
	}

	try {
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

// logout
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
			include: { address: true },
		});

		res.status(200).json(user);
	} catch (err) {
		next(err);
	}
};

// update user
const updateUser = async (req, res, next) => {
	let { firstName, lastName, email, oldPassword, newPassword } = req.body;

	email = email.trim().toLowerCase();
	username = username.trim().toLowerCase();

	const userId = req.user.id;

	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (email || firstName || lastName) {
			await prisma.user.update({
				where: { email: user.email },
				data: {
					firstName,
					lastName,
					email,
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

// add user address
const addAddress = async (req, res, next) => {
	const { street, city, state, is_default } = req.body;

	const userId = req.userId;

	try {
		if (!city || !street || !state) {
			throw new ApiError(
				"Please fill all required inputs",
				400,
			);
		}

		const address = await prisma.address.create({
			data: {
				userId,
				street,
				city,
				state,
				is_default,
			},
		});

		res.status(201).json({ status: "success", address });
	} catch (err) {
		next(err);
	}
};

// forget password
const forgetPass = async (req, res, next) => {
	const { email } = req.body;

	try {
		if (!email) {
			new ApiError("Provide your email address", 400);
		}

		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			new ApiError("Email address does not exist", 403);
		}

		// generate token as a means of authentication for forget password route
		function genTokenPass(email) {
			return jwt.sign({ email }, process.env.JWT_SECRET, {
				expiresIn: "15m",
			});
		}

		// send forget password email
		const info = await transporter.sendMail({
			from: process.env.MY_EMAIL,
			to: email,
			subject: "Reset Your Password",
			html: `<p>Hi ${user.firstName + " " + user.lastName},<br>We received a request to reset the password to your account.<br><br>To create a new password, click the link below:<br><br>http://localhost:4600/api/v1/reset-password/?token=${genTokenPass(email)}<br><br>This link will expire in 15 minutes for your security.<br><br>If you did not request a password reset, you can ignore this email.<br><br>Thanks</p>`,
		});

		res.status(200).json({
			message: "Forget password email sent!",
			email_id: info.messageId,
		});
	} catch (err) {
		next(err);
	}
};

// password rest
const resetPass = async (req, res, next) => {
	const token = req.query.token;
	const { password, confirmPass } = req.body;

	try {
		if (!token) {
			new ApiError("Unauthorized", 401);
		}

		// decode token and extract payload
		const { email, exp } = jwt.verify(
			token,
			process.env.JWT_SECRET,
			{ ignoreExpiration: true },
		);

		if (!email) return;

		if (exp < Math.floor(Date.now() / 1000)) {
			res.status(406).json({ message: "Token link expired" });
			return;
		}

		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (password !== confirmPass) {
			res.status(403).json({
				message: "Incorrect confirm password",
			});
			return;
		}

		const hashPassword = await bcrypt.hash(password, salt);

		await prisma.user.update({
			where: { email },
			data: { password: hashPassword },
		});

		res.status(200).json({
			message: "Your password has been reset successfuly",
		});
	} catch (err) {
		next(err);
	}
};

export {
	register,
	login,
	logout,
	fetchUser,
	updateUser,
	addAddress,
	forgetPass,
	resetPass,
};
