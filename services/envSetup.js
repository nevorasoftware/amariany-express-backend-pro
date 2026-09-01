const dotenv = require('dotenv');
dotenv.config();

function resolveEnv() {
  if (!process.env.DATABASE_URL) {
    if (process.env.DATABASE_PRIVATE_URL) {
      process.env.DATABASE_URL = process.env.DATABASE_PRIVATE_URL;
    } else if (process.env.DATABASE_PUBLIC_URL) {
      process.env.DATABASE_URL = process.env.DATABASE_PUBLIC_URL;
    } else if (process.env.POSTGRES_URL) {
      process.env.DATABASE_URL = process.env.POSTGRES_URL;
    } else if (process.env.PGHOST && process.env.PGPASSWORD) {
      const user = process.env.PGUSER || 'postgres';
      const pass = process.env.PGPASSWORD;
      const host = process.env.PGHOST;
      const port = process.env.PGPORT || '5432';
      const db = process.env.PGDATABASE || process.env.POSTGRES_DB || 'railway';
      process.env.DATABASE_URL = `postgresql://${user}:${pass}@${host}:${port}/${db}`;
    }
  }

  if (process.env.DATABASE_URL) {
    console.log("🔗 DATABASE_URL resuelta para Prisma:", process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
  }
}

resolveEnv();

module.exports = { resolveEnv };
