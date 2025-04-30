// File: /api/list-images.js (Vercel Serverless Function)

import { list } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    const folder = req.query.folderName;
    if (!folder) {
      return res.status(400).json({ error: 'Missing folderName query param' });
    }

    // List all blobs in your bucket
    const { blobs } = await list();

    // Filter by folder prefix and only include image URLs
    const imageUrls = blobs
      .filter(blob => blob.pathname.startsWith(`${folder}/`))
      .map(blob => blob.url);

    res.status(200).json(imageUrls);
  } catch (error) {
    console.error('Blob list error:', error);
    res.status(500).json({ error: 'Failed to list images from Vercel Blob' });
  }
}
