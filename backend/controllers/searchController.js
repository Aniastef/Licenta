import Product from '../models/productModel.js';
import Gallery from '../models/galleryModel.js';
import Article from '../models/articleModel.js';
import Event from '../models/eventModel.js';
import User from '../models/userModel.js';

export const universalSearch = async (req, res) => {
  const { query, category = 'all' } = req.query;
  if (!query) return res.status(400).json({ error: 'Missing query parameter' });

  const regex = new RegExp(query, 'i');
  const limit = 5;
  let results = [];

  try {
    if (category === 'all' || category === 'products') {
      const products = await Product.find({ title: regex }).limit(limit);
      results.push(
        ...products.map((item) => ({
          _id: item._id,
          type: 'product',
          name: item.title,
        })),
      );
    }

    if (category === 'all' || category === 'galleries') {
      const galleries = await Gallery.find({ name: regex })
        .populate('owner', 'username')
        .limit(limit);
      results.push(
        ...galleries.map((item) => ({
          _id: item._id,
          type: 'gallery',
          name: item.title,
          username: item.owner.username, 
        })),
      );
    }

    if (category === 'all' || category === 'articles') {
      const articles = await Article.find({ title: regex }).limit(limit);
      results.push(
        ...articles.map((item) => ({
          _id: item._id,
          type: 'article',
          name: item.title,
        })),
      );
    }

    if (category === 'all' || category === 'events') {
      const events = await Event.find({ title: regex }).limit(limit);
      results.push(
        ...events.map((item) => ({
          _id: item._id,
          type: 'event',
          name: item.name, 
        })),
      );
    }

    if (category === 'all' || category === 'users') {
      const users = await User.find({ username: regex }).select('username').limit(limit);
      results.push(
        ...users.map((item) => ({
          _id: item._id,
          type: 'user',
          name: item.username,
          username: item.username, 
        })),
      );
    }

    res.json(results);
  } catch (err) {
    console.error('Universal search error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
