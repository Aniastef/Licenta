import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minLength: 6,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    age: {
      type: Number,
      required: false,
    },
    profession: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    facebook: {
      type: String,
      default: "",
    },
    instagram: {
      type: String,
      default: "",
    },
    webpage: {
      type: String,
      default: "",
    },
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // ✅ Referință către modelul `Product`
        },
        quantity: { type: Number, default: 1 },
      },
    ],
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Referință către produsele utilizatorului
      },
    ],
    orders: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        price: Number,
        quantity: {
          type: Number,
          default: 1,
        },
        status: {
          type: String,
          enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
          default: "Pending",
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],events: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    galleries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gallery", // Referință la galerii
      },
    ],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    eventsMarkedInterested: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event", // Evenimente marcate ca "interested"
      },
    ],
    eventsMarkedGoing: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event", // Evenimente marcate ca "going"
      },
    ],
    productsMarkedFavorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Produse marcate ca "favorites"
      },
    ],
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"], // ✅ Mai multe roluri
      default: "user",
    },
    isVerified: { type: Boolean, default: false }, // ✅ Verificare email
    verificationToken: { type: String }, // ✅ Token pentru activare
    isBlocked: {
      type: Boolean,
      default: false
    },
    
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
