const { execSync } = require('child_process');
const { resolveEnv } = require('../services/envSetup');

// Asegura que DATABASE_URL esté poblada desde cualquier variable de Railway
resolveEnv();

if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: No se encontró la variable DATABASE_URL ni variables de PostgreSQL en Railway.");
  console.error("Por favor agrega la variable DATABASE_URL en Railway o vincula el servicio Postgres.");
  process.exit(1);
}

try {
  console.log("🔄 Sincronizando esquema de base de datos con Prisma en Railway...");
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    env: process.env
  });
  console.log("✅ Esquema de Prisma sincronizado con éxito.");

  console.log("🌱 Ejecutando sembrado inicial de datos (Admin, Municipios, Rutas)...");
  execSync('node prisma/seed.js', {
    stdio: 'inherit',
    env: process.env
  });
  console.log("✅ Seeding completado exitosamente.");
} catch (error) {
  console.error("❌ Error al preparar la base de datos:", error.message);
  process.exit(1);
}
