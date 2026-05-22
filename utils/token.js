import jwt from "jsonwebtoken";
import "dotenv/config";

export default function generateToken(payload) {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET);
	return token;
}
