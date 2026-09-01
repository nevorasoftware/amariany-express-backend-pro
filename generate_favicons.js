const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const clientPublicDir = path.join(__dirname, '../client/public');
const serverUploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(clientPublicDir)) fs.mkdirSync(clientPublicDir, { recursive: true });
if (!fs.existsSync(serverUploadsDir)) fs.mkdirSync(serverUploadsDir, { recursive: true });

// SVG Icon emblem designed for crisp rendering at all favicon resolutions (16px to 512px)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4C0070"/>
      <stop offset="100%" stop-color="#2D0043"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ED0047"/>
      <stop offset="100%" stop-color="#FF2A6D"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Rounded Tile Container -->
  <rect width="512" height="512" rx="120" fill="url(#bgGrad)"/>
  
  <!-- Subtle Outer Border Accent -->
  <rect x="12" y="12" width="488" height="488" rx="108" fill="none" stroke="url(#accentGrad)" stroke-width="12" opacity="0.6"/>

  <!-- Express Speed Slash Accent -->
  <path d="M 330 110 L 420 110 L 350 240 L 410 240 L 260 410 L 290 290 L 230 290 Z" fill="url(#accentGrad)" />

  <!-- Stylized "A" Monogram -->
  <path d="M 216 120 L 280 120 L 380 390 L 315 390 L 290 320 L 170 320 L 145 390 L 80 390 Z M 230 160 L 188 270 L 272 270 Z" fill="#FFFFFF" />

  <!-- Express Badge Bottom Right Dot -->
  <circle cx="410" cy="410" r="32" fill="#ED0047"/>
</svg>`;

async function generateFavicons() {
  console.log('🔄 Generando favicons oficiales de Amairany Express...');

  // 1. Guardar favicon.svg
  fs.writeFileSync(path.join(clientPublicDir, 'favicon.svg'), faviconSvg);
  fs.writeFileSync(path.join(clientPublicDir, 'logo-icon.svg'), faviconSvg);

  const svgBuffer = Buffer.from(faviconSvg);

  // 2. Generar versiones PNG
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 }
  ];

  for (const item of sizes) {
    const pngBuffer = await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(clientPublicDir, item.name), pngBuffer);
    console.log(` ✅ Creado ${item.name} (${item.size}x${item.size})`);
  }

  // 3. Crear favicon.ico (copia de 32x32 PNG)
  const ico32Buffer = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(clientPublicDir, 'favicon.ico'), ico32Buffer);
  console.log(' ✅ Creado favicon.ico');

  // 4. Crear site.webmanifest
  const manifest = {
    name: "Amairany Express",
    short_name: "Amairany Express",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    theme_color: "#4C0070",
    background_color: "#F3F3F3",
    display: "standalone"
  };

  fs.writeFileSync(
    path.join(clientPublicDir, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2)
  );
  console.log(' ✅ Creado site.webmanifest');

  console.log('✨ Todos los favicons fueron generados con éxito.');
}

generateFavicons().catch(err => {
  console.error('❌ Error generando favicons:', err);
  process.exit(1);
});
