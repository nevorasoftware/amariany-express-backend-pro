const express = require('express');
const { elSalvadorData } = require('../services/elSalvadorData');

const router = express.Router();

// GET /api/locations - Devuelve la jerarquía completa de El Salvador
router.get('/', (req, res) => {
  res.json({
    pais: "El Salvador",
    departamentos: elSalvadorData
  });
});

module.exports = router;
