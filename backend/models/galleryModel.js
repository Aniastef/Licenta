import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },

    category: {
      type: [String],
      enum: [
        'General',
        'Photography',
        'Painting',
        'Drawing',
        'Sketch',
        'Illustration',
        'Digital Art',
        'Pixel Art',
        '3D Art',
        'Animation',
        'Graffiti',
        'Calligraphy',
        'Typography',
        'Collage',
        'Mixed Media',
        'Sculpture',
        'Installation',
        'Fashion',
        'Textile',
        'Architecture',
        'Interior Design',
        'Product Design',
        'Graphic Design',
        'UI/UX',
        'Music',
        'Instrumental',
        'Vocal',
        'Rap',
        'Spoken Word',
        'Podcast',
        'Sound Design',
        'Film',
        'Short Film',
        'Documentary',
        'Cinematography',
        'Video Art',
        'Performance',
        'Dance',
        'Theatre',
        'Acting',
        'Poetry',
        'Writing',
        'Essay',
        'Prose',
        'Fiction',
        'Non-fiction',
        'Journal',
        'Comics',
        'Manga',
        'Zine',
        'Fantasy Art',
        'Surrealism',
        'Realism',
        'Abstract',
        'Minimalism',
        'Expressionism',
        'Pop Art',
        'Concept Art',
        'AI Art',
        'Experimental',
        'Political Art',
        'Activist Art',
        'Environmental Art',
      ],
      default: ['General'],
    },

    description: {
      type: String,
      default: '',
    },
    coverPhoto: {
      type: String,
      default: '',
    },
    tags: [
      {
        type: String,
      },
    ],
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        order: { type: Number, default: 0 },
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    pendingCollaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true },
);

const Gallery = mongoose.model('Gallery', gallerySchema);

export default Gallery;
