import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const p1 = path.join(__dirname, '..', 'public', '.well-known', 'assetlinks.json');
const p2 = path.join(__dirname, '..', 'public', 'twa-manifest.json');

if (fs.existsSync(p1)) fs.unlinkSync(p1);
if (fs.existsSync(p2)) fs.unlinkSync(p2);
console.log("Playstore metadata files cleaned up.");
