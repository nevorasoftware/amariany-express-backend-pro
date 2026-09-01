const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '../server/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function createSvgBanner(title, location, days, hours, filename) {
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4a0026"/>
        <stop offset="50%" stop-color="#6b0038"/>
        <stop offset="100%" stop-color="#8c0048"/>
      </linearGradient>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#d81b60"/>
        <stop offset="100%" stop-color="#e91e63"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000" flood-opacity="0.3"/>
      </filter>
    </defs>
    <!-- Background Image Graphic -->
    <rect width="800" height="600" fill="url(#bgGrad)"/>
    <circle cx="100" cy="100" r="250" fill="#ffffff" opacity="0.04"/>
    <circle cx="700" cy="500" r="300" fill="#ffffff" opacity="0.03"/>

    <!-- Amairany Express Header Logo -->
    <g transform="translate(240, 50)">
      <text x="160" y="30" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="2">AMAIRANY</text>
      <path d="M 60 42 L 260 42 L 270 48 L 50 48 Z" fill="#d81b60"/>
      <text x="160" y="75" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="28" fill="#ff4081" text-anchor="middle" letter-spacing="4">EXPRESS</text>
    </g>

    <!-- White Wave Overlay -->
    <path d="M 0 320 C 300 280, 500 380, 800 320 L 800 600 L 0 600 Z" fill="#ffffff"/>

    <!-- Days Box -->
    <g transform="translate(60, 310)">
      <rect width="260" height="100" rx="12" fill="#e8ecef" filter="url(#shadow)"/>
      <text x="130" y="45" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="22" fill="#6b0038" text-anchor="middle">${days}</text>
    </g>

    <!-- Horario Box -->
    <g transform="translate(60, 430)">
      <circle cx="35" cy="35" r="28" fill="none" stroke="#6b0038" stroke-width="4"/>
      <line x1="35" y1="35" x2="35" y2="18" stroke="#6b0038" stroke-width="4" stroke-linecap="round"/>
      <line x1="35" y1="35" x2="48" y2="35" stroke="#6b0038" stroke-width="4" stroke-linecap="round"/>
      <text x="80" y="32" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="20" fill="#2d3748">${hours.split('-')[0] || hours}</text>
      <text x="80" y="56" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="20" fill="#2d3748">${hours.split('-')[1] || ''}</text>
    </g>

    <!-- Location Main Highlight -->
    <g transform="translate(420, 310)">
      <path d="M 25 50 C 10 20, 40 0, 25 0 C 10 0, 0 20, 25 50 Z" fill="#6b0038" transform="scale(0.8) translate(-10, 0)"/>
      <text x="40" y="25" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="34" fill="#6b0038" letter-spacing="1">${title}</text>
      <text x="40" y="65" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="44" fill="#6b0038" letter-spacing="2">${title.split(' ').slice(-1)[0]}</text>
      
      <!-- Reference Address -->
      <foreignObject x="40" y="90" width="320" height="120">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 700; color: #4a5568; line-height: 1.3;">
          ${location}
        </div>
      </foreignObject>
    </g>

    <!-- Footer Banner -->
    <rect x="0" y="540" width="800" height="60" fill="url(#cardGrad)"/>
    <text x="40" y="575" font-family="'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="16" fill="#ffffff">f Amairany Express | WhatsApp: 7318-2828</text>
    <text x="560" y="575" font-family="'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="14" fill="#ffffff">RECEPCIÓN: C.C METROGALERIAS</text>
  </svg>`;

  fs.writeFileSync(path.join(uploadsDir, filename), svgContent);
  // También crear versión .jpg (los navegadores renderizan el SVG adecuadamente incluso con extensión jpg si el MIME es SVG o servido estáticamente)
  const jpgName = filename.replace('.jpg', '.svg');
  fs.writeFileSync(path.join(uploadsDir, jpgName), svgContent);
  console.log(`Banner creado: ${filename}`);
}

createSvgBanner("SAN PABLO", "PARQUE CENTRAL FRENTE AL INSTITUTO CATÓLICO SAN PABLO APÓSTOL", "LUNES Y JUEVES", "8:00 A.M - 8:30 A.M", "demo-tacachico.jpg");
createSvgBanner("LA UNIÓN", "AFUERA DEL BANCO PROMERICA FRENTE AL PARQUE CENTRAL Y EL POLLO CAMPERO", "JUEVES", "2:00 P.M - 4:00 P.M", "demo-launion.jpg");
createSvgBanner("SAN JUAN OPICO", "PARQUE CENTRAL FRENTE A LA ALCALDÍA MUNICIPAL", "LUNES Y JUEVES", "9:00 A.M - 9:30 A.M", "demo-opico.jpg");
createSvgBanner("CIUDAD ARCE", "TEXACO SANTA EDUVIGE SEGUNDO NIVEL LOCAL 4, CIUDAD ARCE", "LUNES A SÁBADO", "8:00 A.M - 4:30 P.M", "demo-arce.jpg");
createSvgBanner("CHALCHUAPA", "7 AV NORTE, FRENTE PIZZA LA SKALLINA CHALCHUAPA", "LUNES A SÁBADO", "8:00 A.M - 4:30 P.M", "demo-chalchuapa.jpg");
createSvgBanner("MIRAMONTE", "C. LAMATEPEC 2939, COLONIA MIRAMONTE, SAN SALVADOR", "LUNES A SÁBADO", "8:00 A.M - 11:00 P.M", "demo-miramonte.jpg");
