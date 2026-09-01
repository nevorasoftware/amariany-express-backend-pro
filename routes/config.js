const express = require('express');
const fs = require('fs');
const path = require('path');
const { getSiteConfig, updateSiteConfig } = require('../services/dbStore');

const router = express.Router();

// GET /api/config - Obtener la configuración actual y URL del logo desde la base de datos
router.get('/', async (req, res) => {
  try {
    const config = await getSiteConfig();
    res.json({ success: true, data: config });
  } catch (err) {
    console.error('Error al obtener configuración:', err);
    res.status(500).json({ error: 'Error al obtener la configuración del sitio' });
  }
});

// POST /api/config/logo - Subir o actualizar el logo de la empresa (acepta Base64 Data URL)
router.post('/logo', async (req, res) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen en el payload' });
    }

    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    let ext = 'png';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
      if (mime.includes('svg')) ext = 'svg';
      else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
      else if (mime.includes('webp')) ext = 'webp';
    } else {
      buffer = Buffer.from(imageBase64, 'base64');
    }

    const uploadsDir = path.join(__dirname, '../uploads');
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const logoFileName = `logo-${Date.now()}.${ext}`;
      const logoFilePath = path.join(uploadsDir, logoFileName);
      fs.writeFileSync(logoFilePath, buffer);

      // También guardar una copia en logo principal
      const defaultLogoPath = path.join(uploadsDir, `logo.${ext}`);
      fs.writeFileSync(defaultLogoPath, buffer);
    } catch (fsErr) {
      console.warn('Advertencia al escribir copia en disco:', fsErr);
    }

    let logoUrl = imageBase64;
    if (!logoUrl.startsWith('data:')) {
      logoUrl = `data:image/${ext};base64,${imageBase64}`;
    }

    const updated = await updateSiteConfig({ logoUrl });

    res.json({
      message: 'Logo de la empresa actualizado y almacenado exitosamente en la base de datos',
      data: updated
    });
  } catch (err) {
    console.error('Error al subir el logo:', err);
    res.status(500).json({ error: 'Error al procesar la actualización del logo' });
  }
});

// PUT /api/config - Actualizar parámetros generales de configuración (colores, nombre)
router.put('/', async (req, res) => {
  try {
    const updated = await updateSiteConfig(req.body);
    res.json({ message: 'Configuración guardada exitosamente', data: updated });
  } catch (err) {
    console.error('Error al actualizar configuración:', err);
    res.status(500).json({ error: 'Error al guardar la configuración' });
  }
});

module.exports = router;
