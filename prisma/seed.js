require('../services/envSetup');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { elSalvadorData } = require('../services/elSalvadorData');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando sembrado ultrarrápido...');

  // 1. Crear usuario Administrador
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@amairanyexpress.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Administrador Amairany Express',
      role: 'ADMIN'
    }
  });
  console.log(`✅ Admin configurado: ${adminEmail}`);

  // 2. Insertar Departamentos
  const deptsToCreate = elSalvadorData.map(d => ({ nombre: d.departamento }));
  await prisma.departamento.createMany({
    data: deptsToCreate,
    skipDuplicates: true
  });

  const allDepts = await prisma.departamento.findMany();
  const deptMap = new Map(allDepts.map(d => [d.nombre, d.id]));

  // 3. Insertar Municipios
  const municipiosToCreate = [];
  for (const deptData of elSalvadorData) {
    const deptId = deptMap.get(deptData.departamento);
    if (!deptId) continue;
    for (const munData of deptData.municipios) {
      municipiosToCreate.push({
        nombre: munData.nombre,
        departamentoId: deptId
      });
    }
  }

  await prisma.municipio.createMany({
    data: municipiosToCreate,
    skipDuplicates: true
  });

  const allMuns = await prisma.municipio.findMany();
  const munMap = new Map(allMuns.map(m => [`${m.nombre}_${m.departamentoId}`, m.id]));

  // 4. Insertar Distritos
  const distritosToCreate = [];
  for (const deptData of elSalvadorData) {
    const deptId = deptMap.get(deptData.departamento);
    if (!deptId) continue;
    for (const munData of deptData.municipios) {
      const munId = munMap.get(`${munData.nombre}_${deptId}`);
      if (!munId) continue;
      for (const distName of munData.distritos) {
        distritosToCreate.push({
          nombre: distName,
          municipioId: munId
        });
      }
    }
  }

  await prisma.distrito.createMany({
    data: distritosToCreate,
    skipDuplicates: true
  });

  console.log('✅ 14 Departamentos, Municipios y Distritos de El Salvador poblados.');

  // 5. Eliminar cualquier ruta demo previa para dejar la tabla limpia
  await prisma.rutaEntrega.deleteMany({
    where: {
      lugarPrincipal: {
        in: [
          'SAN PABLO TACACHICO',
          'LA UNIÓN',
          'SAN JUAN OPICO',
          'CIUDAD ARCE',
          'CHALCHUAPA',
          'MIRAMONTE'
        ]
      }
    }
  });
  console.log('🧹 Rutas demo eliminadas de la base de datos.');

  // 6. Configuración de Marca y Logo en la base de datos (SiteConfig)
  await prisma.siteConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      logoUrl: '/uploads/logo.svg',
      siteName: 'Amairany Express',
      primaryColor: '#4C0070',
      secondaryColor: '#ED0047',
      bgColor: '#F3F3F3'
    }
  });

  console.log('🎉 ¡Base de datos totalmente inicializada y limpia!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
