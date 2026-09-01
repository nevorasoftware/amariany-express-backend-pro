-- =============================================================================
-- SCRIPT DDL Y SEED PARA POSTGRESQL (AMAIRANY EXPRESS / AMAIRIANI EXPRESS PRO)
-- Compatible con Railway PostgreSQL, DBeaver, pgAdmin y psql
-- =============================================================================

-- Habilitar extensión para UUIDs en PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLA: User
-- ==========================================
DROP TABLE IF EXISTS "User" CASCADE;

CREATE TABLE "User" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL DEFAULT 'Administrador Amairany',
    "role" VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. TABLA: Departamento
-- ==========================================
DROP TABLE IF EXISTS "Departamento" CASCADE;

CREATE TABLE "Departamento" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "nombre" VARCHAR(255) NOT NULL UNIQUE
);

-- ==========================================
-- 3. TABLA: Municipio
-- ==========================================
DROP TABLE IF EXISTS "Municipio" CASCADE;

CREATE TABLE "Municipio" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "nombre" VARCHAR(255) NOT NULL,
    "departamentoId" VARCHAR(36) NOT NULL,
    CONSTRAINT "fk_municipio_departamento" FOREIGN KEY ("departamentoId") 
        REFERENCES "Departamento"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "unique_municipio_nombre_departamento" UNIQUE ("nombre", "departamentoId")
);

-- ==========================================
-- 4. TABLA: Distrito
-- ==========================================
DROP TABLE IF EXISTS "Distrito" CASCADE;

CREATE TABLE "Distrito" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "nombre" VARCHAR(255) NOT NULL,
    "municipioId" VARCHAR(36) NOT NULL,
    CONSTRAINT "fk_distrito_municipio" FOREIGN KEY ("municipioId") 
        REFERENCES "Municipio"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "unique_distrito_nombre_municipio" UNIQUE ("nombre", "municipioId")
);

-- ==========================================
-- 5. TABLA: RutaEntrega
-- ==========================================
DROP TABLE IF EXISTS "RutaEntrega" CASCADE;

CREATE TABLE "RutaEntrega" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "lugarPrincipal" TEXT NOT NULL,
    "lugarReferencia" TEXT NOT NULL,
    "dias" VARCHAR(255) NOT NULL,
    "horario" VARCHAR(255) NOT NULL,
    "imagenUrl" TEXT,
    "tipoPunto" VARCHAR(100) NOT NULL DEFAULT 'PUNTO DE ENTREGA',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    
    "departamentoId" VARCHAR(36),
    "departamentoNombre" VARCHAR(255),
    
    "municipioId" VARCHAR(36),
    "municipioNombre" VARCHAR(255),
    
    "distritoId" VARCHAR(36),
    "distritoNombre" VARCHAR(255),
    
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "fk_ruta_departamento" FOREIGN KEY ("departamentoId") 
        REFERENCES "Departamento"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fk_ruta_municipio" FOREIGN KEY ("municipioId") 
        REFERENCES "Municipio"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fk_ruta_distrito" FOREIGN KEY ("distritoId") 
        REFERENCES "Distrito"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ==========================================
-- 6. TABLA: SiteConfig
-- ==========================================
DROP TABLE IF EXISTS "SiteConfig" CASCADE;

CREATE TABLE "SiteConfig" (
    "id" VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    "logoUrl" TEXT NOT NULL DEFAULT '/uploads/logo.svg',
    "siteName" VARCHAR(255) NOT NULL DEFAULT 'Amairany Express',
    "primaryColor" VARCHAR(50) NOT NULL DEFAULT '#4C0070',
    "secondaryColor" VARCHAR(50) NOT NULL DEFAULT '#ED0047',
    "bgColor" VARCHAR(50) NOT NULL DEFAULT '#F3F3F3',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INSERCIÓN DE DATOS INICIALES (SEED DATA)
-- =============================================================================

-- 1. Usuario Administrador por Defecto (Email: admin@amairanyexpress.com / Pass: Admin123!)
INSERT INTO "User" ("id", "email", "password", "name", "role", "createdAt", "updatedAt")
VALUES (
    uuid_generate_v4()::text,
    'admin@amairanyexpress.com',
    '$2a$10$7R0Zq8tC1y.0v2z9e/79e.E7Z19G4W9G9uM9U1rZ.E7Z19G4W9G9u', -- Hash Bcrypt de Admin123!
    'Administrador Amairany Express',
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO NOTHING;

-- 2. Configuración de Marca por Defecto (SiteConfig)
INSERT INTO "SiteConfig" ("id", "logoUrl", "siteName", "primaryColor", "secondaryColor", "bgColor", "updatedAt")
VALUES (
    'default',
    '/uploads/logo.svg',
    'Amairany Express',
    '#4C0070',
    '#ED0047',
    '#F3F3F3',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;
