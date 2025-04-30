const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const imagesDir = path.join(__dirname, 'images');

// Enable CORS for all routes
app.use(cors());

// Serve static files from the images directory
app.use('/images', express.static(imagesDir));

import { list } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    const { blobs } = await list();

    const folderName = req.query.folderName;
    const images = blobs
      .filter(blob => blob.pathname.startsWith(folderName + "/"))
      .map(blob => blob.url);

    res.status(200).json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to list images' });
  }
}

// Helper function to recursively get all image files
function getImagesRecursively(dir) 
{
  let results = [];
  const files = fs.readdirSync(dir); // Read all files and directories in the current directory

  files.forEach(file => {
    const filePath = path.join(dir, file); // Get the full path of the file
    const stat = fs.statSync(filePath); // Get the file/directory stats

    if (stat && stat.isDirectory()) {
      // If it's a directory, recurse into it
      results = results.concat(getImagesRecursively(filePath));
    } else if (/\.(jpg|jpeg|png|gif)$/i.test(file)) {
      // If it's an image file, add its relative path
      results.push(path.relative(imagesDir, filePath).replace(/\\/g, '/'));
    }
  });

  return results;
}

// API endpoint to list images from a specific folder or path
app.get('/api/images/:folder', (req, res) => {
  try {
    // Extract the folder path from the query parameter
    const folderName = req.params.folder;
    const folderPath = path.join(imagesDir, folderName);

    // Check if the folder exists
    console.log("Checking folder path:", folderPath);
    if (!fs.existsSync(folderPath)) {
      return res.status(404).send('Folder not found');
    }

    // Get all images recursively from the folder
    const imageFiles = getImagesRecursively(folderPath);
    const baseFolder = path.join(imagesDir, folderName);
    const trimmed = imageFiles.map(file => file.replace(`${folderName}/`, ''));
    res.json(trimmed);
    
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Unable to fetch images');
  }
});

app.get('/', (req, res) => res.send('Server is running'));

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));