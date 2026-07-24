import jwt from "jsonwebtoken";
import "dotenv/config";

// generate token for user authentification (login)
export default function generateToken(userId) {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET);
	return token;
}
