import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
	{
	  name: { type: String, required: true },
	  category: {
		type: String,
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
		default: "General"
	  },	  
	  description: { type: String, default: "" },
	  favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	  price: { type: Number, required: false },
	  currency: {
  type: String,
  enum: [
    "USD", // US Dollar
    "EUR", // Euro
    "GBP", // British Pound
    "RON", // Romanian Leu
    "CHF", // Swiss Franc
    "NOK", // Norwegian Krone
    "SEK", // Swedish Krona
    "DKK", // Danish Krone
    "PLN", // Polish Zloty
    "CZK", // Czech Koruna
    "HUF", // Hungarian Forint
    "BGN", // Bulgarian Lev
    "HRK", // Croatian Kuna (optional, for historical data)
    "ISK", // Icelandic Krona
    "TRY", // Turkish Lira (non-EU, but often relevant)
    "RSD", // Serbian Dinar
    "UAH", // Ukrainian Hryvnia
    "JPY", // Japanese Yen (non-EU, but already present)
    "CAD", // Canadian Dollar
    "AUD"  // Australian Dollar
  ],
  default: "EUR"
},

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