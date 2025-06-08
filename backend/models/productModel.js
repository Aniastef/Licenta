// productModel.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
	{
	  title: { type: String, required: true },
	  category: { // <--- MODIFICATION HERE
		type: [String], // Change to an array of strings
		enum: [
		  "General", "Photography", "Painting", "Drawing", "Sketch", "Illustration", "Digital Art",
		  "Pixel Art", "3D Art", "Animation", "Graffiti", "Calligraphy", "Typography", "Collage",
		  "Mixed Media", "Sculpture", "Installation", "Fashion", "Textile", "Architecture",
		  "Interior Design", "Product Design", "Graphic Design", "UI/UX", "Music", "Instrumental",
		  "Vocal", "Rap", "Spoken Word", "Podcast", "Sound Design", "Film", "Short Film",
		  "Documentary", "Cinematography", "Video Art", "Performance", "Dance", "Theatre", "Acting",
		  "Poetry", "Writing", "Essay", "Prose", "Fiction", "Non-fiction", "Journal", "Comics",
		  "Manga", "Zine", "Fantasy Art", "Surrealism", "Realism", "Abstract", "Minimalism",
		  "Expressionism", "Pop Art", "Concept Art", "AI Art", "Experimental", "Political Art",
		  "Activist Art", "Environmental Art"
		],
		default: ["General"] // Default to an array with "General"
	  },
	  description: { type: String, default: "" },
	  favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	  price: { type: Number, required: false },
	  quantity: { type: Number, required: true, default: 0 },
	  forSale: { type: Boolean, default: true },
	  tags: [{ type: String }],
	  images: [{ type: String, default: "" }],
	  videos: [{ type: String, default: "" }],
	  audios: [{ type: String, default: "" }],
	  writing: [{ type: String, default: ""}],
	  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	  galleries: [{ type: mongoose.Schema.Types.ObjectId, ref: "Gallery" }],
	  averageRating: { type: Number, default: 0 },
	},
	{ timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;