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
    coordinates: { // Adăugarea câmpului de coordonate
      lat: {
        type: Number,
        required: false, // Asigură-te că latitudinea este obligatorie
      },
      lng: {
        type: Number,
        required: false, // Asigură-te că longitudinea este obligatorie
      },
    },
    date: {
      type: Date,
      required: false
    },
    time: {
      type: String,
      required: false
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
      price: {
        type: Number,
        default: 0,
      },
      ticketType: {
        type: String,
        enum: ["free", "paid", "donation"],
        default: "free",
      },
      language: {
        type: String,
        default: "ro",
      },
      collaborators: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      gallery: [
        {
          type: String, // Cloudinary URLs
        },
      ],
      attachments: [
        {
          fileName: String,
          fileUrl: String,
        },
      ],
      visibility: {
        type: String,
        enum: ["public", "private"],
        default: "public",
      },
      isDraft: {
        type: Boolean,
        default: false,
      },
      
  },
  {
    timestamps: true, // Include createdAt și updatedAt
  }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
