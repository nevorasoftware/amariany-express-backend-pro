const express = require('express');
const { getRutas, createRuta, updateRuta, deleteRuta, findExistingRuta } = require('../services/dbStore');

const router = express.Router();

// GET /api/routes - Obtener todas las rutas con filtros opcionales
router.get('/', async (req, res) => {
  try {
    const { departamento, municipio, distrito, search } = req.query;
    const rutas = await getRutas({ departamento, municipio, distrito, search });
    res.json({ count: rutas.length, data: rutas });
  } catch (err) {
    console.error('Error al obtener rutas:', err);
    res.status(500).json({ error: 'Error al consultar rutas de entrega' });
  }
});

// POST /api/routes - Crear nueva ruta (Admin)
router.post('/', async (req, res) => {
  try {
    const { lugarPrincipal, lugarReferencia } = req.body;
    if (lugarPrincipal) {
      const existing = await findExistingRuta(lugarPrincipal, lugarReferencia);
      if (existing) {
        return res.status(400).json({ 
          error: `No se puede guardar: La ruta para "${lugarPrincipal.trim().toUpperCase()}" con la referencia especificada ya existe registrada en el sistema.` 
        });
      }
    }

    const newRuta = await createRuta(req.body);
    res.status(201).json({ message: 'Ruta creada exitosamente', data: newRuta });
  } catch (err) {
    console.error('Error al crear ruta:', err);
    res.status(500).json({ error: 'Error al guardar la ruta' });
  }
});

// PUT /api/routes/:id - Actualizar ruta (Admin)
router.put('/:id', async (req, res) => {
  try {
    const updated = await updateRuta(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }
    res.json({ message: 'Ruta actualizada exitosamente', data: updated });
  } catch (err) {
    console.error('Error al actualizar ruta:', err);
    res.status(500).json({ error: 'Error al actualizar la ruta' });
  }
});

// DELETE /api/routes/:id - Eliminar ruta (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteRuta(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }
    res.json({ message: 'Ruta eliminada exitosamente' });
  } catch (err) {
    console.error('Error al eliminar ruta:', err);
    res.status(500).json({ error: 'Error al eliminar la ruta' });
  }
});

module.exports = router;
