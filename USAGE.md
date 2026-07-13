# CoolSongProxy API

This project provides a simple API to fetch metadata for your hosted MP3 files.

## Fetching the Song List

The song metadata is served as a static JSON file at the root of your deployment.

### Endpoint
`GET /songs.json`

### Response Format
```json
[
  {
    "name": "Song Title",
    "artist": "Artist Name",
    "thumbnail": "data:image/jpeg;base64,...",
    "file": "https://pub-xxxx.r2.dev/filename.mp3",
    "popular": true
  }
]
```

## How to Maintain the Library

1.  **Upload MP3s:** Upload new MP3 files to your Cloudflare R2 bucket.
2.  **Update File List:** Add the new filenames to `file-list.json`. You can also manually flag songs as popular.
    ```json
    [
      "Normal Song.mp3",
      { "file": "Popular Song.mp3", "popular": true }
    ]
    ```
3.  **Generate Index:** Run `npm run build` locally. This fetches metadata from R2, generates the new `public/songs.json`, and saves it.
4.  **Deploy:** Commit and push the changes to GitHub. Vercel will update the `songs.json` served at your site's root.
