const express = require('express');
const { getSellers, createSeller, updateSeller, deleteSeller } = require('../services/dbStore');

const router = express.Router();

// GET /api/sellers - Listar vendedores con filtro opcional de búsqueda
router.get('/', async (req, res) => {
  try {
    const search = req.query.search || '';
    const sellers = await getSellers(search);
    return res.json({ success: true, data: sellers });
  } catch (err) {
    console.error('Error al obtener clientes/vendedores:', err);
    return res.status(500).json({ error: 'Error al consultar clientes/vendedores' });
  }
});

// Validador estricto de campos de vendedores
const validateSellerData = (data, isUpdate = false) => {
  const { nombre, dui, tienda, correo, whatsapp, cuentaBancoAgricola } = data;

  if (!nombre || !nombre.trim()) {
    return 'Todos los campos son obligatorios: El Nombre Completo es requerido.';
  }
  if (!dui || !dui.trim()) {
    return 'Todos los campos son obligatorios: El campo DUI es requerido.';
  }
  if (!/^\d{8}-\d{1}$/.test(dui.trim())) {
    return 'El DUI debe tener el formato de 8 números, un guión y 1 número (Ej: 00000000-0).';
  }
  if (!tienda || !tienda.trim()) {
    return 'Todos los campos son obligatorios: El nombre de Tienda/Negocio es requerido.';
  }
  if (!correo || !correo.trim()) {
    return 'Todos los campos son obligatorios: El Correo Electrónico es requerido.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
    return 'El Correo Electrónico no es válido (Ej: usuario@dominio.com).';
  }
  if (!whatsapp || !whatsapp.trim()) {
    return 'Todos los campos son obligatorios: El WhatsApp / Teléfono es requerido.';
  }
  if (!/^\d{4}-\d{4}$/.test(whatsapp.trim())) {
    return 'El WhatsApp / Teléfono debe tener el formato de 4 números, un guión y 4 números (Ej: 7788-9900).';
  }
  if (!cuentaBancoAgricola || !cuentaBancoAgricola.trim()) {
    return 'Todos los campos son obligatorios: La Cuenta de Banco Agrícola es requerida.';
  }
  if (!/^\d+$/.test(cuentaBancoAgricola.trim())) {
    return 'La Cuenta de Banco Agrícola debe ser numérica (únicamente dígitos).';
  }

  return null;
};

// POST /api/sellers - Crear cliente/vendedor
router.post('/', async (req, res) => {
  try {
    const validationError = validateSellerData(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { nombre, dui, tienda, correo, whatsapp, cuentaBancoAgricola, estado } = req.body;

    const seller = await createSeller({
      nombre: nombre.trim(),
      dui: dui.trim(),
      tienda: tienda.trim(),
      correo: correo.trim(),
      whatsapp: whatsapp.trim(),
      cuentaBancoAgricola: cuentaBancoAgricola.trim(),
      estado: estado || 'ACTIVO'
    });

    return res.status(201).json({ success: true, data: seller });
  } catch (err) {
    console.error('Error al crear vendedor:', err);
    return res.status(500).json({ error: 'Error al registrar vendedor' });
  }
});

// PUT /api/sellers/:id - Actualizar cliente/vendedor
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'ID de vendedor requerido' });
    }

    const validationError = validateSellerData(req.body, true);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { nombre, dui, tienda, correo, whatsapp, cuentaBancoAgricola, estado } = req.body;

    const updatedSeller = await updateSeller(id, {
      nombre: nombre.trim(),
      dui: dui.trim(),
      tienda: tienda.trim(),
      correo: correo.trim(),
      whatsapp: whatsapp.trim(),
      cuentaBancoAgricola: cuentaBancoAgricola.trim(),
      estado: estado || undefined
    });

    return res.json({ success: true, data: updatedSeller });
  } catch (err) {
    console.error('Error al actualizar vendedor:', err);
    return res.status(500).json({ error: 'Error al modificar vendedor' });
  }
});

// DELETE /api/sellers/:id - Eliminar cliente/vendedor
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteSeller(id);
    return res.json({ success: true, message: 'Vendedor eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar vendedor:', err);
    return res.status(500).json({ error: 'Error al eliminar vendedor' });
  }
});

module.exports = router;
