import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Numele modelului User
        required: true, // Face ca asocierea să fie obligatorie
        },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"], // Opțiuni valide pentru status
      default: "upcoming", // Status implicit
    },
    location: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      required: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String, // Fiecare tag va fi un string
      },
    ],
    interestedParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId, // Referință către utilizator
        ref: "User",
      },
    ],
    goingParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId, // Referință către utilizator
        ref: "User",
      },
    ],
  },
  {
    timestamps: true, // Include createdAt și updatedAt
  }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
