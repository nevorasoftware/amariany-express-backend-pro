const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractRouteInfoFromImage } = require('../services/aiService');

const router = express.Router();

// Configuración de almacenamiento Multer
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'amairany-ruta-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB máx
});

// POST /api/ai/analyze-image - Cargar imagen y extraer texto con IA
router.post('/analyze-image', upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Debe adjuntar una imagen para procesar' });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Data = imageBuffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;
    const relativeUrl = `/uploads/${req.file.filename}`;

    const extractedInfo = await extractRouteInfoFromImage(
      imageBuffer,
      req.file.mimetype,
      req.file.originalname
    );

    res.json({
      message: 'Imagen analizada con éxito mediante IA',
      imagenUrl: dataUrl || relativeUrl,
      relativeUrl,
      extracted: extractedInfo
    });

  } catch (err) {
    console.error('Error en /api/ai/analyze-image:', err);
    res.status(500).json({ error: 'Error al procesar la imagen con IA: ' + err.message });
  }
});

module.exports = router;
