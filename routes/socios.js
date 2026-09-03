const express = require('express');
const { getSocios, createSocio, updateSocio, deleteSocio, getSocioById } = require('../services/dbStore');

const router = express.Router();

// GET /api/socios - Listar socios con filtro opcional de búsqueda
router.get('/', async (req, res) => {
  try {
    const search = req.query.search || '';
    const socios = await getSocios(search);
    return res.json({ success: true, data: socios });
  } catch (err) {
    console.error('Error al obtener socios:', err);
    return res.status(500).json({ error: 'Error al consultar lista de socios' });
  }
});

// GET /api/socios/:id - Obtener socio por ID
router.get('/:id', async (req, res) => {
  try {
    const socio = await getSocioById(req.params.id);
    if (!socio) {
      return res.status(404).json({ error: 'Socio no encontrado' });
    }
    return res.json({ success: true, data: socio });
  } catch (err) {
    console.error('Error al obtener socio:', err);
    return res.status(500).json({ error: 'Error al consultar socio' });
  }
});

// Validador de datos de socio
const validateSocioData = (data) => {
  const { nombre, telefono, correo, dui } = data;

  if (!nombre || !nombre.trim()) {
    return 'El Nombre Completo del socio es requerido.';
  }
  if (dui && dui.trim() && !/^\d{8}-\d{1}$/.test(dui.trim())) {
    return 'El DUI debe tener el formato de 8 números, un guión y 1 número (Ej: 00000000-0).';
  }
  if (correo && correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
    return 'El Correo Electrónico no es válido (Ej: usuario@dominio.com).';
  }
  if (telefono && telefono.trim() && !/^\d{4}-\d{4}$/.test(telefono.trim())) {
    return 'El Teléfono debe tener el formato de 4 números, un guión y 4 números (Ej: 7788-9900).';
  }

  return null;
};

// POST /api/socios - Crear nuevo socio (con código correlativo S-### y ruta asignada)
router.post('/', async (req, res) => {
  try {
    const validationError = validateSocioData(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { nombre, telefono, correo, dui, ruta, rutas, codigo } = req.body;

    const socio = await createSocio({
      codigo: codigo ? codigo.trim() : undefined,
      nombre: nombre.trim(),
      telefono: telefono ? telefono.trim() : '',
      correo: correo ? correo.trim() : '',
      dui: dui ? dui.trim() : '',
      ruta: ruta ? (typeof ruta === 'string' ? ruta.trim() : '') : '',
      rutas: rutas !== undefined ? rutas : ruta
    });

    return res.status(201).json({ success: true, data: socio });
  } catch (err) {
    console.error('Error al crear socio:', err);
    return res.status(500).json({ error: 'Error al registrar socio' });
  }
});

// PUT /api/socios/:id - Actualizar socio
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'ID de socio requerido' });
    }

    const validationError = validateSocioData(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { nombre, telefono, correo, dui, ruta, rutas } = req.body;

    const updatedSocio = await updateSocio(id, {
      nombre: nombre.trim(),
      telefono: telefono ? telefono.trim() : '',
      correo: correo ? correo.trim() : '',
      dui: dui ? dui.trim() : '',
      ruta: ruta ? (typeof ruta === 'string' ? ruta.trim() : '') : '',
      rutas: rutas !== undefined ? rutas : ruta
    });

    return res.json({ success: true, data: updatedSocio });
  } catch (err) {
    console.error('Error al actualizar socio:', err);
    return res.status(500).json({ error: 'Error al modificar socio' });
  }
});

// DELETE /api/socios/:id - Eliminar socio
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteSocio(id);
    return res.json({ success: true, message: 'Socio eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar socio:', err);
    return res.status(500).json({ error: 'Error al eliminar socio' });
  }
});

module.exports = router;
