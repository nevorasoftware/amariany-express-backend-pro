const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

let prisma = new PrismaClient();

async function initDb() {
  try {
    await prisma.$connect();
    console.log("🐘 Conectado exitosamente a PostgreSQL mediante Prisma (100% Persistente).");
  } catch (err) {
    console.error("❌ Error conectando a PostgreSQL:", err.message);
    throw err;
  }
}

async function findUserByEmail(email) {
  return await prisma.user.findUnique({ where: { email } });
}

async function getRutas(filters = {}) {
  const where = {};
  if (filters.departamento) where.departamentoNombre = { equals: filters.departamento, mode: 'insensitive' };
  if (filters.municipio) where.municipioNombre = { equals: filters.municipio, mode: 'insensitive' };
  if (filters.distrito) where.distritoNombre = { equals: filters.distrito, mode: 'insensitive' };
  if (filters.search) {
    const term = filters.search.trim();
    where.OR = [
      { codigo: { contains: term, mode: 'insensitive' } },
      { lugarPrincipal: { contains: term, mode: 'insensitive' } },
      { lugarReferencia: { contains: term, mode: 'insensitive' } }
    ];
  }
  return await prisma.rutaEntrega.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
}

async function createRuta(data) {
  let routeCode = data.codigo && data.codigo.trim() ? data.codigo.trim() : null;
  if (!routeCode) {
    try {
      const dbRes = await prisma.$queryRaw`SELECT generar_codigo_ruta() as code`;
      if (dbRes && dbRes[0] && dbRes[0].code) {
        routeCode = dbRes[0].code;
      }
    } catch (dbErr) {
      routeCode = generateRouteCode();
    }
  }
  if (!routeCode) {
    routeCode = generateRouteCode();
  }

  return await prisma.rutaEntrega.create({
    data: {
      codigo: routeCode,
      lugarPrincipal: data.lugarPrincipal || "NUEVO PUNTO",
      lugarReferencia: data.lugarReferencia || "",
      dias: data.dias || "LUNES A VIERNES",
      horario: data.horario || "8:00 A.M - 5:00 P.M",
      imagenUrl: data.imagenUrl || null,
      tipoPunto: data.tipoPunto || "PUNTO DE ENTREGA",
      departamentoNombre: data.departamentoNombre || null,
      municipioNombre: data.municipioNombre || null,
      distritoNombre: data.distritoNombre || null,
      departamentoId: data.departamentoId || null,
      municipioId: data.municipioId || null,
      distritoId: data.distritoId || null,
      activo: data.activo !== undefined ? data.activo : true
    }
  });
}

async function updateRuta(id, data) {
  return await prisma.rutaEntrega.update({
    where: { id },
    data
  });
}

async function deleteRuta(id) {
  return await prisma.rutaEntrega.delete({ where: { id } });
}

async function findExistingRuta(lugarPrincipal, lugarReferencia) {
  if (!lugarPrincipal) return null;
  const whereCondition = {
    lugarPrincipal: { equals: lugarPrincipal.trim(), mode: 'insensitive' }
  };
  if (lugarReferencia && lugarReferencia.trim()) {
    whereCondition.lugarReferencia = { equals: lugarReferencia.trim(), mode: 'insensitive' };
  }
  return await prisma.rutaEntrega.findFirst({ where: whereCondition });
}

async function getSiteConfig() {
  let config = await prisma.siteConfig.findUnique({ where: { id: "default" } });
  if (!config) {
    config = await prisma.siteConfig.create({
      data: {
        id: "default",
        logoUrl: "/uploads/logo.svg",
        siteName: "Amairany Express",
        primaryColor: "#4C0070",
        secondaryColor: "#ED0047",
        bgColor: "#F3F3F3"
      }
    });
  }
  return config;
}

async function updateSiteConfig(data) {
  return await prisma.siteConfig.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data }
  });
}

// OPERACIONES DE CLIENTES / VENDEDORES
async function getSellers(search = '') {
  const where = {};
  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { codigo: { contains: term, mode: 'insensitive' } },
      { nombre: { contains: term, mode: 'insensitive' } },
      { tienda: { contains: term, mode: 'insensitive' } },
      { whatsapp: { contains: term, mode: 'insensitive' } },
      { dui: { contains: term, mode: 'insensitive' } },
      { correo: { contains: term, mode: 'insensitive' } }
    ];
  }
  return await prisma.seller.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
}

async function createSeller(data) {
  let sellerCode = data.codigo && data.codigo.trim() ? data.codigo.trim() : null;
  if (!sellerCode) {
    try {
      const dbRes = await prisma.$queryRaw`SELECT generar_codigo_vendedor() as code`;
      if (dbRes && dbRes[0] && dbRes[0].code) {
        sellerCode = dbRes[0].code;
      }
    } catch (dbErr) {
      sellerCode = generateSellerCode();
    }
  }
  if (!sellerCode) {
    sellerCode = generateSellerCode();
  }

  return await prisma.seller.create({
    data: {
      codigo: sellerCode,
      nombre: data.nombre,
      dui: data.dui || '',
      tienda: data.tienda || '',
      correo: data.correo || '',
      whatsapp: data.whatsapp || '',
      cuentaBancoAgricola: data.cuentaBancoAgricola || '',
      estado: data.estado || 'ACTIVO'
    }
  });
}

async function updateSeller(id, data) {
  return await prisma.seller.update({
    where: { id },
    data: {
      nombre: data.nombre,
      dui: data.dui !== undefined ? data.dui : undefined,
      tienda: data.tienda !== undefined ? data.tienda : undefined,
      correo: data.correo !== undefined ? data.correo : undefined,
      whatsapp: data.whatsapp !== undefined ? data.whatsapp : undefined,
      cuentaBancoAgricola: data.cuentaBancoAgricola !== undefined ? data.cuentaBancoAgricola : undefined,
      estado: data.estado !== undefined ? data.estado : undefined
    }
  });
}

async function deleteSeller(id) {
  return await prisma.seller.delete({ where: { id } });
}

// Generador de Código Único de Paquete (ej. P-8A9X2)
function generatePackageCode() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = 'P-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generador de Código Único de Vendedor (ej. V-7A1)
function generateSellerCode() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = 'V-';
  for (let i = 0; i < 3; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generador de Código Único de Ruta (ej. R-X92)
function generateRouteCode() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = 'R-';
  for (let i = 0; i < 3; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generador de Código Único de Socio (ej. S-3K8)
function generateSocioCode() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = 'S-';
  for (let i = 0; i < 3; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// OPERACIONES DE PAQUETES (CASILLERO)
async function getPackages(search = '') {
  const where = {};
  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { codigo: { contains: term, mode: 'insensitive' } },
      { cliente: { contains: term, mode: 'insensitive' } },
      { destino: { contains: term, mode: 'insensitive' } },
      { vendedorNombre: { contains: term, mode: 'insensitive' } },
      { telefono: { contains: term, mode: 'insensitive' } },
      { tipoPago: { contains: term, mode: 'insensitive' } },
      { estado: { contains: term, mode: 'insensitive' } }
    ];
  }
  return await prisma.package.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
}

async function createPackage(data) {
  let pkgCode = data.codigo && data.codigo.trim() ? data.codigo.trim() : null;
  if (!pkgCode) {
    try {
      const dbRes = await prisma.$queryRaw`SELECT generar_codigo_paquete() as code`;
      if (dbRes && dbRes[0] && dbRes[0].code) {
        pkgCode = dbRes[0].code;
      }
    } catch (dbErr) {
      pkgCode = generatePackageCode();
    }
  }
  if (!pkgCode) {
    pkgCode = generatePackageCode();
  }

  const tipoPagoVal = (data.tipoPago && ['EFECTIVO', 'TRANSFERENCIA'].includes(data.tipoPago.toUpperCase())) 
    ? data.tipoPago.toUpperCase() 
    : 'EFECTIVO';

  const todayFormatted = new Date().toLocaleDateString('es-SV');

  return await prisma.package.create({
    data: {
      codigo: pkgCode,
      cliente: data.cliente,
      destino: data.destino,
      vendedorNombre: data.vendedorNombre,
      valor: parseFloat(data.valor) || 0,
      envio: parseFloat(data.envio) || 0,
      total: parseFloat(data.total) || 0,
      telefono: data.telefono,
      fechaRecepcion: data.fechaRecepcion || todayFormatted,
      fechaEntrega: data.fechaEntrega || null,
      fechaPagado: data.fechaPagado || null,
      fechaAbonado: data.fechaAbonado || null,
      imagenUrl: data.imagenUrl || null,
      imagenEntregaUrl: data.imagenEntregaUrl || null,
      tipoPago: tipoPagoVal,
      estado: data.estado || 'RECEPCIONADO',
      estadoLiquidacion: data.estadoLiquidacion || 'PENDIENTE',
      planillaId: data.planillaId || null
    }
  });
}

async function updatePackage(id, data) {
  const updateData = {};
  if (data.cliente !== undefined) updateData.cliente = data.cliente;
  if (data.destino !== undefined) updateData.destino = data.destino;
  if (data.vendedorNombre !== undefined) updateData.vendedorNombre = data.vendedorNombre;
  if (data.valor !== undefined) updateData.valor = parseFloat(data.valor);
  if (data.envio !== undefined) updateData.envio = parseFloat(data.envio);
  if (data.total !== undefined) updateData.total = parseFloat(data.total);
  if (data.telefono !== undefined) updateData.telefono = data.telefono;
  if (data.fechaRecepcion !== undefined) updateData.fechaRecepcion = data.fechaRecepcion;
  if (data.fechaEntrega !== undefined) updateData.fechaEntrega = data.fechaEntrega;
  if (data.fechaPagado !== undefined) updateData.fechaPagado = data.fechaPagado;
  if (data.fechaAbonado !== undefined) updateData.fechaAbonado = data.fechaAbonado;
  if (data.imagenUrl !== undefined) updateData.imagenUrl = data.imagenUrl;
  if (data.imagenEntregaUrl !== undefined) updateData.imagenEntregaUrl = data.imagenEntregaUrl;
  if (data.tipoPago !== undefined && ['EFECTIVO', 'TRANSFERENCIA'].includes(data.tipoPago.toUpperCase())) {
    updateData.tipoPago = data.tipoPago.toUpperCase();
  }
  if (data.estado !== undefined) updateData.estado = data.estado;
  if (data.estadoLiquidacion !== undefined) updateData.estadoLiquidacion = data.estadoLiquidacion;
  if (data.planillaId !== undefined) updateData.planillaId = data.planillaId;

  return await prisma.package.update({
    where: { id },
    data: updateData
  });
}

async function getPackageByCode(codigo) {
  if (!codigo) return null;
  const term = codigo.trim();
  return await prisma.package.findFirst({
    where: {
      codigo: { equals: term, mode: 'insensitive' }
    }
  });
}

async function deletePackage(id) {
  return await prisma.package.delete({ where: { id } });
}

// OPERACIONES DE PLANILLAS (LIQUIDACIONES)
async function getPlanillas() {
  return await prisma.planilla.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

async function createPlanilla(data) {
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await prisma.planilla.count();
  const codigo = data.codigo || `PLN-${todayStr}-${(count + 1).toString().padStart(2, '0')}`;
  const dateFormatted = data.fecha || new Date().toLocaleDateString('es-SV');
  
  const created = await prisma.planilla.create({
    data: {
      codigo,
      fecha: dateFormatted,
      tipoPago: data.tipoPago || 'TRANSFERENCIA',
      montoTotal: parseFloat(data.montoTotal) || 0,
      estado: data.estado || 'GENERADA',
      detalleJson: typeof data.detalleJson === 'string' ? data.detalleJson : JSON.stringify(data.detalleJson || [])
    }
  });

  // Vincular planillaId a paquetes incluidos
  let packageIds = [];
  try {
    const detail = typeof data.detalleJson === 'string' ? JSON.parse(data.detalleJson) : (data.detalleJson || []);
    packageIds = detail.map(p => p.id).filter(Boolean);
  } catch (e) {}

  if (packageIds.length > 0) {
    const updatePayload = { planillaId: created.id };
    if (data.tipoPago === 'TRANSFERENCIA' && (data.estado === 'ABONADO' || data.estado === 'PROCESADA')) {
      updatePayload.estadoLiquidacion = data.estado;
      updatePayload.fechaAbonado = dateFormatted;
    } else if (data.tipoPago === 'EFECTIVO' && data.estado === 'PROCESADA') {
      updatePayload.estadoLiquidacion = 'PROCESADA';
      updatePayload.fechaPagado = dateFormatted;
    }
    await prisma.package.updateMany({
      where: { id: { in: packageIds } },
      data: updatePayload
    });
  }

  return created;
}

async function updatePlanilla(id, data) {
  const existing = await prisma.planilla.findUnique({ where: { id } });
  if (!existing) throw new Error('Planilla no encontrada');

  const updateData = {};
  if (data.estado !== undefined) updateData.estado = data.estado;
  if (data.montoTotal !== undefined) updateData.montoTotal = parseFloat(data.montoTotal);
  if (data.detalleJson !== undefined) {
    updateData.detalleJson = typeof data.detalleJson === 'string' ? data.detalleJson : JSON.stringify(data.detalleJson);
  }

  const updated = await prisma.planilla.update({
    where: { id },
    data: updateData
  });

  const dateFormatted = updated.fecha || new Date().toLocaleDateString('es-SV');

  // Actualizar masivamente paquetes de la planilla
  let packageIds = [];
  try {
    const detail = JSON.parse(updated.detalleJson || '[]');
    packageIds = detail.map(p => p.id).filter(Boolean);
  } catch (e) {}

  if (packageIds.length > 0) {
    const massUpdateData = { planillaId: id };
    if (existing.tipoPago === 'TRANSFERENCIA' && (data.estado === 'ABONADO' || data.estado === 'PROCESADA')) {
      massUpdateData.estadoLiquidacion = data.estado;
      massUpdateData.fechaAbonado = dateFormatted;
    } else if (existing.tipoPago === 'EFECTIVO' && data.estado === 'PROCESADA') {
      massUpdateData.estadoLiquidacion = 'PROCESADA';
      massUpdateData.fechaPagado = dateFormatted;
    }
    
    await prisma.package.updateMany({
      where: { id: { in: packageIds } },
      data: massUpdateData
    });
  }

  return updated;
}

async function liquidarPackageIndividual(id, estadoLiquidacion = 'PROCESADA') {
  const dateFormatted = new Date().toLocaleDateString('es-SV');
  return await prisma.package.update({
    where: { id },
    data: { 
      estadoLiquidacion,
      fechaPagado: dateFormatted
    }
  });
}

// OPERACIONES DE SOCIOS (REPARTIDORES / SOCIOS CON RUTA)
async function getSocios(search = '') {
  const where = {};
  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { codigo: { contains: term, mode: 'insensitive' } },
      { nombre: { contains: term, mode: 'insensitive' } },
      { telefono: { contains: term, mode: 'insensitive' } },
      { correo: { contains: term, mode: 'insensitive' } },
      { dui: { contains: term, mode: 'insensitive' } },
      { ruta: { contains: term, mode: 'insensitive' } },
      { rutas: { contains: term, mode: 'insensitive' } }
    ];
  }
  return await prisma.socio.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
}

async function getSocioById(id) {
  if (!id) return null;
  return await prisma.socio.findUnique({ where: { id } });
}

async function createSocio(data) {
  let socioCode = data.codigo && data.codigo.trim() ? data.codigo.trim() : null;
  if (!socioCode) {
    try {
      const dbRes = await prisma.$queryRaw`SELECT generar_codigo_socio() as code`;
      if (dbRes && dbRes[0] && dbRes[0].code) {
        socioCode = dbRes[0].code;
      }
    } catch (dbErr) {
      socioCode = generateSocioCode();
    }
  }
  if (!socioCode) {
    socioCode = generateSocioCode();
  }

  // Normalizar lista de rutas
  let rutasStr = '';
  if (Array.isArray(data.rutas)) {
    rutasStr = data.rutas.filter(Boolean).join(', ');
  } else if (typeof data.rutas === 'string' && data.rutas.trim()) {
    rutasStr = data.rutas.trim();
  } else if (data.ruta && typeof data.ruta === 'string') {
    rutasStr = data.ruta.trim();
  }

  return await prisma.socio.create({
    data: {
      codigo: socioCode,
      nombre: data.nombre,
      telefono: data.telefono || '',
      correo: data.correo || '',
      dui: data.dui || '',
      ruta: rutasStr,
      rutas: rutasStr
    }
  });
}

async function updateSocio(id, data) {
  let rutasStr = undefined;
  if (data.rutas !== undefined) {
    if (Array.isArray(data.rutas)) {
      rutasStr = data.rutas.filter(Boolean).join(', ');
    } else if (typeof data.rutas === 'string') {
      rutasStr = data.rutas.trim();
    }
  } else if (data.ruta !== undefined && typeof data.ruta === 'string') {
    rutasStr = data.ruta.trim();
  }

  return await prisma.socio.update({
    where: { id },
    data: {
      nombre: data.nombre !== undefined ? data.nombre : undefined,
      telefono: data.telefono !== undefined ? data.telefono : undefined,
      correo: data.correo !== undefined ? data.correo : undefined,
      dui: data.dui !== undefined ? data.dui : undefined,
      ruta: rutasStr !== undefined ? rutasStr : undefined,
      rutas: rutasStr !== undefined ? rutasStr : undefined
    }
  });
}

async function deleteSocio(id) {
  return await prisma.socio.delete({ where: { id } });
}

module.exports = {
  initDb,
  findUserByEmail,
  getRutas,
  createRuta,
  updateRuta,
  deleteRuta,
  findExistingRuta,
  getSiteConfig,
  updateSiteConfig,
  getSellers,
  createSeller,
  updateSeller,
  deleteSeller,
  getPackages,
  getPackageByCode,
  createPackage,
  updatePackage,
  deletePackage,
  getPlanillas,
  createPlanilla,
  updatePlanilla,
  liquidarPackageIndividual,
  getSocios,
  getSocioById,
  createSocio,
  updateSocio,
  deleteSocio
};

