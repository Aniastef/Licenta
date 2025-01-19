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
    coverPhoto: {
      type: String,
      default: "", // Imaginea de copertă pentru profilul utilizatorului
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
    artGalleries: [
      {
        type: {
          type: String,
          enum: ["Photography", "Sculpture", "Painting", "Other"],
          required: true,
        },
        description: {
          type: String,
          default: "",
        },
        coverPhoto: {
          type: String,
          default: "", // Imaginea de copertă pentru galerie
        },
        products: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product", // Asociează produsele cu galeria
          },
        ],
      },
    ],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
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
