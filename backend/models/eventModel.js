import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    owner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Proprietarul galeriei
          required: true,
        },
    description: {
      type: String,
      default: "",
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
