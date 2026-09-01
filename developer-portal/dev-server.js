import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const DEV_PORT = process.env.DEV_PORT || 5050;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Direct proxy or notification
app.get('/api/*', (req, res) => {
  res.redirect(`http://localhost:5000${req.originalUrl}`);
});

app.listen(DEV_PORT, () => {
  console.log(`[DEVELOPER PORTAL STANDALONE] Running on http://localhost:${DEV_PORT}`);
  console.log(`[INFO] Connected to Master Backend API at http://localhost:5000`);
});
