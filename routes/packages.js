const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getPackages, getPackageByCode, createPackage, updatePackage, deletePackage } = require('../services/dbStore');
const { extractPackageInfoFromImage } = require('../services/aiService');

const router = express.Router();

// Configurar almacenamiento de imágenes para paquetes
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `package-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// GET /api/packages - Listar paquetes ingresados
router.get('/', async (req, res) => {
  try {
    const search = req.query.search || '';
    const packages = await getPackages(search);
    return res.json({ success: true, data: packages });
  } catch (err) {
    console.error('Error al consultar paquetes:', err);
    return res.status(500).json({ error: 'Error al consultar paquetes' });
  }
});

// GET /api/packages/code/:codigo - Buscar paquete por código exacto
router.get('/code/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    if (!codigo) return res.status(400).json({ error: 'Código de paquete requerido' });

    const pkg = await getPackageByCode(codigo);
    if (!pkg) {
      return res.status(404).json({ error: `No se encontró ningún paquete con el código "${codigo}"` });
    }
    return res.json({ success: true, data: pkg });
  } catch (err) {
    console.error('Error al buscar paquete por código:', err);
    return res.status(500).json({ error: 'Error al buscar paquete por código' });
  }
});

// POST /api/packages/upload-delivery-image - Subir fotografía de comprobante de entrega
router.post('/upload-delivery-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha adjuntado ninguna imagen de entrega' });
    }
    const fileBuffer = fs.readFileSync(req.file.path);
    const mimeType = req.file.mimetype || 'image/jpeg';
    const base64Url = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    return res.json({ success: true, data: { imagenEntregaUrl: base64Url } });
  } catch (err) {
    console.error('Error al subir imagen de entrega:', err);
    return res.status(500).json({ error: 'Error al subir imagen de entrega' });
  }
});

// POST /api/packages/analyze-image - Analizar guía/imagen con Gemini 1.5 Pro
router.post('/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha adjuntado ninguna imagen de paquete' });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = req.file.mimetype || 'image/jpeg';
    const base64Url = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

    console.log(`🤖 Iniciando OCR con Gemini 1.5 Pro para la imagen: ${req.file.filename}`);

    const extracted = await extractPackageInfoFromImage(fileBuffer, mimeType, req.file.originalname);

    return res.json({
      success: true,
      data: {
        ...extracted,
        imagenUrl: base64Url
      }
    });
  } catch (err) {
    console.error('Error en extracción de paquete por IA Gemini:', err);
    return res.status(500).json({ error: 'Error al analizar la imagen del paquete con Gemini' });
  }
});

// POST /api/packages - Recepcionar / Registrar paquete
router.post('/', async (req, res) => {
  try {
    const { codigo, cliente, destino, vendedorNombre, valor, envio, total, telefono, fechaEntrega, imagenUrl, tipoPago, estado } = req.body;

    if (!cliente || !cliente.trim()) {
      return res.status(400).json({ error: 'El nombre del cliente (destinatario) es obligatorio.' });
    }
    if (!destino || !destino.trim()) {
      return res.status(400).json({ error: 'El destino / dirección de entrega es obligatorio.' });
    }
    if (!vendedorNombre || !vendedorNombre.trim()) {
      return res.status(400).json({ error: 'El Vendedor / Tienda / Emisor es obligatorio.' });
    }
    if (!telefono || !telefono.trim()) {
      return res.status(400).json({ error: 'El teléfono de contacto es obligatorio.' });
    }

    const newPackage = await createPackage({
      codigo: codigo ? codigo.trim() : null,
      cliente: cliente.trim(),
      destino: destino.trim(),
      vendedorNombre: vendedorNombre.trim(),
      valor: parseFloat(valor) || 0,
      envio: parseFloat(envio) || 0,
      total: parseFloat(total) || (parseFloat(valor) || 0) + (parseFloat(envio) || 0),
      telefono: telefono.trim(),
      fechaEntrega: fechaEntrega ? fechaEntrega.trim() : new Date().toLocaleDateString('es-SV'),
      imagenUrl: imagenUrl || null,
      tipoPago: tipoPago ? tipoPago.trim().toUpperCase() : 'EFECTIVO',
      estado: estado || 'RECEPCIONADO'
    });

    return res.status(201).json({ success: true, data: newPackage });
  } catch (err) {
    console.error('Error al recepcionar paquete:', err);
    return res.status(500).json({ error: 'Error al recepcionar paquete' });
  }
});

// PUT /api/packages/:id - Actualizar paquete
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID de paquete requerido' });

    const updated = await updatePackage(id, req.body);
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error al actualizar paquete:', err);
    return res.status(500).json({ error: 'Error al actualizar paquete' });
  }
});

// PUT /api/packages/:id/liquidar - Liquidar paquete individualmente (para pagos en efectivo uno a uno)
router.put('/:id/liquidar', async (req, res) => {
  try {
    const { id } = req.params;
    const { estadoLiquidacion } = req.body;
    if (!id) return res.status(400).json({ error: 'ID de paquete requerido' });

    const updated = await updatePackage(id, { estadoLiquidacion: estadoLiquidacion || 'PROCESADA' });
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error al liquidar paquete individual:', err);
    return res.status(500).json({ error: 'Error al liquidar paquete' });
  }
});

// DELETE /api/packages/:id - Eliminar paquete
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deletePackage(id);
    return res.json({ success: true, message: 'Paquete eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar paquete:', err);
    return res.status(500).json({ error: 'Error al eliminar paquete' });
  }
});

module.exports = router;
