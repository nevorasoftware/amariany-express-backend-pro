const express = require('express');
const router = express.Router();
const { getPlanillas, createPlanilla, updatePlanilla } = require('../services/dbStore');

// GET /api/planillas - Listar todas las planillas de liquidación
router.get('/', async (req, res) => {
  try {
    const list = await getPlanillas();
    return res.json(list);
  } catch (err) {
    console.error('Error al obtener planillas:', err);
    return res.status(500).json({ error: 'Error al obtener planillas de liquidación' });
  }
});

// POST /api/planillas - Crear una nueva planilla
router.post('/', async (req, res) => {
  try {
    const { codigo, fecha, tipoPago, montoTotal, estado, detalleJson } = req.body;
    const newPlanilla = await createPlanilla({
      codigo,
      fecha,
      tipoPago,
      montoTotal,
      estado,
      detalleJson
    });
    return res.status(201).json({ success: true, data: newPlanilla });
  } catch (err) {
    console.error('Error al crear planilla:', err);
    return res.status(500).json({ error: 'Error al crear planilla de liquidación' });
  }
});

// PUT /api/planillas/:id - Actualizar estado o detalle de una planilla
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID de planilla requerido' });

    const updated = await updatePlanilla(id, req.body);
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error al actualizar planilla:', err);
    return res.status(500).json({ error: 'Error al actualizar planilla: ' + err.message });
  }
});

module.exports = router;
