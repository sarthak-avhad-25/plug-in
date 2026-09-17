const sharp = require('sharp');
const fs = require('fs');

async function processIcons() {
  const input = "./Screenshot 2026-09-17 at 11.18.28 AM.png";
  
  // Make a square 512x512 icon for PWA
  await sharp(input)
    .resize({
      width: 512,
      height: 512,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    })
    .toFile('public/icon-512.png');

  // Make a square 192x192 icon for PWA
  await sharp(input)
    .resize({
      width: 192,
      height: 192,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    })
    .toFile('public/icon-192.png');
    
  // Make a square 180x180 icon for Apple Touch
  await sharp(input)
    .resize({
      width: 180,
      height: 180,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    })
    .toFile('src/app/apple-icon.png');
    
  // Also put a general icon.png in src/app for Next.js to auto-inject favicon
  await sharp(input)
    .resize({
      width: 192,
      height: 192,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    })
    .toFile('src/app/icon.png');
    
  console.log("Icons generated successfully.");
}

processIcons().catch(console.error);
