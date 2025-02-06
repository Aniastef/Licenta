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
	  tags: [
		{
		  type: String, // Fiecare tag va fi un string
		},
	  ],
	  images: [
		{
		  type: String,
		  default: "",
		},
	  ],
	  user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User", // Numele modelului User
		required: true, // Face ca asocierea să fie obligatorie
	  },
	  galleries: [{ type: mongoose.Schema.Types.ObjectId, ref: "Gallery" }], // ✅ Acum produsul poate aparține mai multor galerii

	},
	{
	  timestamps: true,
	}
);  

const Product = mongoose.model("Product", productSchema);

export default Product;
