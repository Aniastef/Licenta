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
	  gallery: { type: String, required: true, enum: ["painting", "sculpture", "drawing"] }, // Categoriile permise

	  user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User", // Numele modelului User
		required: true, // Face ca asocierea să fie obligatorie
	  },
	},
	{
	  timestamps: true,
	}
);  

const Product = mongoose.model("Product", productSchema);

export default Product;
