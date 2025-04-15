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
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
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
        products: [
          {
            product: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Product",
              required: true,
            },
            price: Number,
            quantity: { type: Number, default: 1 },
          }
        ],
        status: {
          type: String,
          enum: ["Pending", "Delivered", "Cancelled"],
          default: "Pending",
        },
        date: { type: Date, default: Date.now },
    
        paymentMethod: {
          type: String,
          enum: ["online", "cash", "card_on_delivery"],
          default: "online",
        },
        deliveryMethod: {
          type: String,
          enum: ["courier", "easybox"],
          default: "courier",
        },
        firstName: String,
        lastName: String,
        address: String,
        postalCode: String,
        city: String,
        phone: String,
      }
    ],
    events: [
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
    optimisticConcurrency: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
