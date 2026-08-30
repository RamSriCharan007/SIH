import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, r, g, b, innerR, innerG, innerB) {
  // Generate uncompressed raw scanlines: 1 filter byte (0) + width * 4 bytes (RGBA)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check if inside rounded square or circle
      const isCorner = Math.abs(dx) > width * 0.42 && Math.abs(dy) > height * 0.42;

      if (dist < radius && !isCorner) {
        // Cross pattern in center
        const inCrossH = Math.abs(dy) < height * 0.08 && Math.abs(dx) < width * 0.28;
        const inCrossV = Math.abs(dx) < width * 0.08 && Math.abs(dy) < height * 0.28;

        if (inCrossH || inCrossV) {
          rawData[pixelOffset] = 255;     // R
          rawData[pixelOffset + 1] = 255; // G
          rawData[pixelOffset + 2] = 255; // B
          rawData[pixelOffset + 3] = 255; // A
        } else {
          // Teal gradient background
          const t = y / height;
          rawData[pixelOffset] = Math.floor(13 + t * 5);      // R
          rawData[pixelOffset + 1] = Math.floor(148 - t * 40); // G
          rawData[pixelOffset + 2] = Math.floor(136 - t * 60); // B
          rawData[pixelOffset + 3] = 255; // A
        }
      } else {
        // Transparent outside
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  // CRC32
  const crc = calculateCrc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc >>> 0, 8 + length);
  return chunk;
}

function calculateCrc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }

  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

// Generate Icons
const icon192 = createPng(192, 192, 13, 148, 136, 255, 255, 255);
fs.writeFileSync('d:/SIH/public/icon-192.png', icon192);
console.log('✓ Created public/icon-192.png (' + icon192.length + ' bytes)');

const icon512 = createPng(512, 512, 13, 148, 136, 255, 255, 255);
fs.writeFileSync('d:/SIH/public/icon-512.png', icon512);
console.log('✓ Created public/icon-512.png (' + icon512.length + ' bytes)');

const appleIcon = createPng(180, 180, 13, 148, 136, 255, 255, 255);
fs.writeFileSync('d:/SIH/public/apple-touch-icon.png', appleIcon);
console.log('✓ Created public/apple-touch-icon.png (' + appleIcon.length + ' bytes)');

fs.writeFileSync('d:/SIH/public/favicon.png', createPng(64, 64, 13, 148, 136, 255, 255, 255));
console.log('✓ Created public/favicon.png');
