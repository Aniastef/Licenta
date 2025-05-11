// --- articleController.js ---
import Article from '../models/articleModel.js';

export const createArticle = async (req, res) => {
  try {
    const { title, subtitle, content, coverImage } = req.body; // 🆕 adaugă coverImage
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const article = new Article({
      title,
      subtitle,
      content,
      coverImage, // 🆕 setează-l
      user: req.user._id,
    });

    await article.save();
    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getArticlesByUser = async (req, res) => {
  try {
    const { username } = req.params;
    const articles = await Article.find()
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    const filtered = articles.filter(a => a.user.username === username);
    res.status(200).json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyArticles = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const articles = await Article.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// GET /api/articles?search=abc&from=2024-01-01&to=2024-12-31
export const getAllArticlesFiltered = async (req, res) => {
  try {
    const { search = "", from, to } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { subtitle: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const articles = await Article.find(filter)
      .populate("user", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id).populate('user', 'username');
    if (!article) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, content, coverImage } = req.body; // 🆕 adaugă coverImage

    const article = await Article.findById(id);
    if (!article) return res.status(404).json({ error: 'Not found' });
    if (article.user.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Unauthorized' });

    article.title = title || article.title;
    article.subtitle = subtitle || article.subtitle;
    article.content = content || article.content;
    article.coverImage = coverImage || article.coverImage; // 🆕 updatează dacă a fost modificată

    await article.save();

    res.status(200).json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
