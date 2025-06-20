const Repo = require('../models/Repo');

const getRelativeTime = (date) => {
  const now = new Date('2025-06-20T10:28:00+05:30'); // Current date and time in IST
  const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

// Create a new repo (single)
exports.createRepo = async (req, res) => {
  try {
    const { name, tagline, category, stack, stars, lastUpdated, isTopPick, githubUrl, deepWikiUrl } = req.body;
    const repo = new Repo({
      name,
      tagline,
      category,
      stack,
      stars,
      lastUpdated: lastUpdated ? new Date(lastUpdated) : new Date(),
      isTopPick,
      githubUrl,
      deepWikiUrl
    });
    const savedRepo = await repo.save();
    res.status(201).json(savedRepo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create multiple repos (bulk)
exports.createBulkRepos = async (req, res) => {
  try {
    const repos = req.body; // Expecting an array of repo objects
    if (!Array.isArray(repos) || repos.length === 0) {
      return res.status(400).json({ message: 'Request body must be a non-empty array of repo objects' });
    }

    // Validate and prepare repos for bulk insertion
    const validRepos = repos.map(repo => ({
      name: repo.name || `Unnamed-${Math.random().toString(36).substr(2, 9)}`,
      tagline: repo.tagline || '',
      category: repo.category || 'Miscellaneous',
      stack: Array.isArray(repo.stack) ? repo.stack : [],
      stars: repo.stars || 0,
      lastUpdated: repo.lastUpdated ? new Date(repo.lastUpdated) : new Date(),
      isTopPick: repo.isTopPick || false,
      githubUrl: repo.githubUrl || '',
      deepWikiUrl: repo.deepWikiUrl || ''
    }));

    const savedRepos = await Repo.insertMany(validRepos, { ordered: false });
    res.status(201).json(savedRepos);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all repos with filters
exports.getRepos = async (req, res) => {
  try {
    const { searchQuery, sortBy, filterCategory, showTopPicksOnly, limit } = req.query;

    let query = {};
    if (filterCategory && filterCategory !== 'All') query.category = filterCategory;
    if (showTopPicksOnly === 'true') query.isTopPick = true;
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { tagline: { $regex: searchQuery, $options: 'i' } },
        { category: { $regex: searchQuery, $options: 'i' } },
        { stack: { $in: [new RegExp(searchQuery, 'i')] } }
      ];
    }

    let sort = {};
    switch (sortBy) {
      case 'stars':
        sort.stars = -1;
        break;
      case 'updated':
        sort.lastUpdated = -1;
        break;
      case 'name':
        sort.name = 1;
        break;
      default:
        sort.lastUpdated = -1;
    }

    const repos = await Repo.find(query)
      .sort(sort)
      .limit(limit ? parseInt(limit) : 0);

    const response = repos.map(repo => ({
      ...repo.toObject(),
      lastUpdatedRelative: getRelativeTime(repo.lastUpdated)
    }));

    res.json({
      repos: response,
      total: await Repo.countDocuments(query),
      remaining: (await Repo.countDocuments(query)) - (limit ? parseInt(limit) : repos.length)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single repo by ID
exports.getRepoById = async (req, res) => {
  try {
    const repo = await Repo.findById(req.params.id);
    if (!repo) return res.status(404).json({ message: 'Repo not found' });
    res.json({ ...repo.toObject(), lastUpdatedRelative: getRelativeTime(repo.lastUpdated) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a repo
exports.updateRepo = async (req, res) => {
  try {
    const { name, tagline, category, stack, stars, lastUpdated, isTopPick, githubUrl, deepWikiUrl } = req.body;
    const repo = await Repo.findByIdAndUpdate(
      req.params.id,
      {
        name,
        tagline,
        category,
        stack,
        stars,
        lastUpdated: lastUpdated ? new Date(lastUpdated) : new Date(),
        isTopPick,
        githubUrl,
        deepWikiUrl
      },
      { new: true, runValidators: true }
    );
    if (!repo) return res.status(404).json({ message: 'Repo not found' });
    res.json(repo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a repo
exports.deleteRepo = async (req, res) => {
  try {
    const repo = await Repo.findByIdAndDelete(req.params.id);
    if (!repo) return res.status(404).json({ message: 'Repo not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unique categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Repo.distinct('category');
    res.json(['All', ...categories.sort()]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};