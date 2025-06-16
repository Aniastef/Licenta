import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
    },
    location: {
      type: String,
      default: '',
    },
    coordinates: {
      lat: {
        type: Number,
        required: false,
      },
      lng: {
        type: Number,
        required: false,
      },
    },
    date: {
      type: Date,
      required: false,
    },
    time: {
      type: String,
      required: false,
    },
    coverImage: {
      type: String,
      default: '',
    },
    tags: [
      {
        type: String,
      },
    ],
    interestedParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    goingParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    price: {
      type: Number,
      default: 0,
    },
    ticketType: {
      type: String,
      enum: ['free', 'paid', 'donation'],
      default: 'free',
    },
    language: {
      type: String,
      default: 'english',
    },
    gallery: [
      {
        type: String,
      },
    ],
    attachments: [
      {
        fileName: String,
        fileUrl: String,
      },
    ],
    category: {
      type: String,
      enum: [
        'Music',
        'Art',
        'Tech',
        'Workshop',
        'Theatre',
        'Festival',
        'Literature',
        'Exhibition',
        'Dance',
        'Film',
        'Charity',
        'Community',
        'Education',
        'Universal',
      ],
      default: 'Universal',
    },
    capacity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Event = mongoose.model('Event', eventSchema);

export default Event;
