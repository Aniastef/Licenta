import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			default: "",
		},
		price: {
			type: Number,
			required: true,
		},
		images: [
			{
				type: String, 
				default: "",  
			},
		],
		comments: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId, 
					ref: "User",
					required: true,
				},
				comment: {
					type: String,
					required: true,
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		favorites: [
			{
				type: mongoose.Schema.Types.ObjectId, 
				ref: "User",
			},
		],
	},
	{
		timestamps: true, 
	}
);

const Product = mongoose.model("Product", productSchema);

export default Product;
