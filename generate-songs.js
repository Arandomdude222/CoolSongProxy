const fs = require('fs');
const path = require('path');
const https = require('https');
const mm = require('music-metadata');
const Redis = require('ioredis');

const fileListPath = path.join(__dirname, 'file-list.json');
const outputFile = path.join(__dirname, 'public', 'songs.json');
const R2_BASE_URL = 'https://pub-1c79986ea9fd4e8ba1314119816ce4f1.r2.dev';

const redis = new Redis(process.env.REDIS_URL);

async function getPopularityData() {
  const keys = await redis.keys('hit:*');
  if (keys.length === 0) return {};

  const values = await redis.mget(keys);
  const hits = keys.map((key, i) => ({
    file: key.replace('hit:', ''),
    count: parseInt(values[i] || 0)
  }));

  const total = hits.reduce((sum, h) => sum + h.count, 0);
  const average = total / hits.length;

  const popularity = {};
  hits.forEach(h => {
    popularity[h.file] = h.count > average;
  });
  return popularity;
}

async function fetchAndParse(fileName, popularityMap) {
  return new Promise((resolve, reject) => {
    const url = `${R2_BASE_URL}/${encodeURIComponent(fileName)}`;
    https.get(url, async (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${fileName}: Status ${res.statusCode}`));
        return;
      }
      try {
        const metadata = await mm.parseStream(res);
        
        let thumbnailBase64 = null;
        if (metadata.common.picture && metadata.common.picture.length > 0) {
          const picture = metadata.common.picture[0];
          thumbnailBase64 = `data:${picture.format};base64,${picture.data.toString('base64')}`;
        }

        resolve({
          name: metadata.common.title || path.parse(fileName).name,
          artist: metadata.common.artist || 'Unknown',
          thumbnail: thumbnailBase64,
          file: `/api/stream?file=${encodeURIComponent(fileName)}`,
          popular: !!popularityMap[fileName]
        });
      } catch (err) {
        reject(err);
      }
    }).on('error', reject);
  });
}

async function generateSongsIndex() {
  const popularityMap = await getPopularityData();
  const files = JSON.parse(fs.readFileSync(fileListPath, 'utf8'));
  const songs = [];

  for (const fileEntry of files) {
    try {
      const fileName = typeof fileEntry === 'string' ? fileEntry : fileEntry.file;
      console.log(`Processing ${fileName}...`);
      const songData = await fetchAndParse(fileName, popularityMap);
      songs.push(songData);
    } catch (err) {
      console.error(`Error processing ${fileEntry}:`, err.message);
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(songs, null, 2));
  console.log(`Generated ${outputFile} with ${songs.length} songs.`);
  await redis.disconnect();
}

generateSongsIndex();
