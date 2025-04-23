const express = require('express');
const cors = require('cors'); // Import the cors package
const fs = require('fs');
const path = require('path');

const app = express();
const imagesDir = path.join(__dirname, 'images');

// Enable CORS for all routes
app.use(cors());

app.use('/images', express.static(imagesDir));

app.get('/api/images', (req, res) => {
  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to fetch images');
    }
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
    res.json(imageFiles);
  });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));