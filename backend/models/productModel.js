import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
	{
	  name: { type: String, required: true },
	  description: { type: String, default: "" },
	  favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	  price: { type: Number, required: false },
	  quantity: { type: Number, required: true, default: 0 }, // ✅ Stocul produsului
	  forSale: { type: Boolean, default: true }, // ✅ Dacă produsul este de vânzare sau doar pentru afișare
	  tags: [{ type: String }],
	  images: [{ type: String, default: "" }],
	  videos: [{ type: String, default: "" }], // ✅ Nou
	  audios: [{ type: String, default: "" }], // ✅ Nou
	  writing: [{ type: String, default: ""}], // 🆕 POEZIE / TEXT
	  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	  galleries: [{ type: mongoose.Schema.Types.ObjectId, ref: "Gallery" }],
	  averageRating: { type: Number, default: 0 },
	},
	{ timestamps: true }
);  

const Product = mongoose.model("Product", productSchema);
export default Product;