import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "15d",
	});

	const isProduction = process.env.NODE_ENV === "production";

	res.cookie("jwt", token, {
		httpOnly: true,
		secure: isProduction,              // true doar în producție
		sameSite: isProduction ? "none" : "lax", // compatibil cu CORS în producție
		maxAge: 15 * 24 * 60 * 60 * 1000   // 15 zile
	});

	return token;
};

export default generateTokenAndSetCookie;
