# CoolSongProxy Usage Guide

This project serves as a frontend for your music library, with files hosted on Cloudflare R2 and metadata generated automatically.

## Workflow to Add New Songs

1.  **Upload Files:**
    Upload your MP3 files to your Cloudflare R2 bucket.

2.  **Update File List:**
    Open `file-list.json` in this repository and add the exact filenames of the new MP3s you just uploaded to R2.
    ```json
    [
      "Artist - Song Name.mp3",
      "Another Song.mp3"
    ]
    ```

3.  **Generate Index:**
    Run the build script locally. This will fetch the metadata (Artist, Name, Thumbnail) directly from the files in your R2 bucket and update `public/songs.json`.
    ```bash
    npm run build
    ```

4.  **Deploy:**
    Commit and push the changes to your GitHub repository.
    ```bash
    git add .
    git commit -m "Add new songs to library"
    git push
    ```
    Vercel will automatically redeploy your site with the updated `songs.json`.
