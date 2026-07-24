import nodemailer from "nodemailer";

// This function is used to trim out white space and convert first character to uppercase for consistency
function modifier(name) {
	name =
		name.charAt(0).toUpperCase() +
		name.trim().toLowerCase().slice(1);

	return name;
}

// create a nodemailer transporter: A transporter is used to establish connection to your smtp server and send email on your behave.
const transporter = nodemailer.createTransport({
	service: "sendgrid",
	auth: {
		user: "apikey",
		pass: process.env.AUTH_SENDGRID_API_KEY,
	},
});

// password validator
function passValidator(password) {
	// password validation variables
	const lengthV = /^.{8,}$/;
	const letterV = /[a-zA-Z]/; //at least one letter must be included
	const numV = /[0-9]/; //at least one number must be included
	const symbolV = /[@!&£#]/; //at least one symbol must be included
	const forbiddenSeq = /1234/; //forbidden sequence of number 1234, 12345, 123456, 1234567, 12345678, 123456789

	const errorMessages = [];

	if (!lengthV.test(password)) {
		errorMessages.push(
			"Password must be at least 8 characters long.",
		);
	}

	if (!letterV.test(password)) {
		errorMessages.push(
			"Password must contain at least one letter.",
		);
	}

	if (!numV.test(password)) {
		errorMessages.push(
			"Password must contain at least one number.",
		);
	}

	if (!symbolV.test(password)) {
		errorMessages.push(
			"Password must contain at least one special symbol (@!&£#).",
		);
	}

	if (forbiddenSeq.test(password)) {
		errorMessages.push(
			"Password cannot contain the sequence '1234'.",
		);
	}

	return errorMessages;
}

export { modifier, transporter, passValidator };
