const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);
const R2_BASE_URL = 'https://pub-1c79986ea9fd4e8ba1314119816ce4f1.r2.dev';

module.exports = async (req, res) => {
  const { file } = req.query;
  if (!file) return res.status(400).send('Missing file parameter');

  try {
    // Increment hit count
    await redis.incr(`hit:${file}`);
    
    // Redirect
    res.redirect(`${R2_BASE_URL}/${encodeURIComponent(file)}`);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('Internal Server Error');
  }
};
