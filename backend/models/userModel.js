import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			minLength: 6,
			required: true,
		},
		profilePic: {
			type: String,
			default: "",
		},
		bio: {
			type: String,
			default: "",
		},
		favorites: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product", 
			},
		],
	},
	{
		timestamps: true, // createdAt, updatedAt
	}
);

const User = mongoose.model("User", userSchema);

export default User;
