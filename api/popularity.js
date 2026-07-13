const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

module.exports = async (req, res) => {
  try {
    // Get all hit keys
    const keys = await redis.keys('hit:*');
    if (keys.length === 0) return res.json({});

    // Get all values
    const values = await redis.mget(keys);
    
    // Calculate average
    const hits = keys.map((key, i) => ({
      file: key.replace('hit:', ''),
      count: parseInt(values[i] || 0)
    }));

    const total = hits.reduce((sum, h) => sum + h.count, 0);
    const average = total / hits.length;

    // Determine popularity (greater than average)
    const popularity = {};
    hits.forEach(h => {
      popularity[h.file] = h.count > average;
    });

    res.json(popularity);
  } catch (error) {
    console.error('Popularity error:', error);
    res.status(500).send('Error');
  }
};
