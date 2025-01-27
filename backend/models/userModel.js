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
    profilePic: {
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
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Referință către produsele utilizatorului
      },
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
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
