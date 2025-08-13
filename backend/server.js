const express = require('express')
const cors = require('cors')
const app = express()
//TEST
const multer = require('multer');
const mysql = require('mysql');
const upload = multer({ storage: multer.memoryStorage() });

const port = 3000

const api = require('./router/index.js')

app.use(cors())
app.use(express.json())
app.use("/api",api)

// TEST
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'reservation',
  port: '3306'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected');
});

// Upload image
app.post('/upload', upload.single('image'), (req, res) => {
  const fileBuffer = req.file.buffer;
  const mimeType = req.file.mimetype;

  db.query(
    'INSERT INTO image_files (image, mime_type) VALUES (?, ?)',
    [fileBuffer, mimeType],
    (err, result) => {
      if (err) throw err;
      res.json({ message: 'Image saved!', id: result.insertId });
    }
  );
});

// Retrieve image by ID
app.get('/image/:id', (req, res) => {
  db.query(
    'SELECT product_image, img_mime FROM products WHERE product_id = ?',
    [req.params.id],
    (err, results) => {
      if (err) throw err;
      if (!results.length) return res.status(404).send('Not found');

      res.setHeader('Content-Type', results[0].img_mime);
      res.send(results[0].product_image);
    }
  );
});

// Fetch all image metadata
app.get('/fetchAllImage', (req, res) => {
  db.query(
    'SELECT id, mime_type FROM image_files',
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Server error');
      }
      if (!results.length) return res.status(404).send('No images found');

      // Return metadata only; frontend will fetch actual image via /image/:id
      res.json(results);
    }
  );
});

app.listen(port,() => {
    console.log(`Server listening on port ${port}`)
})