-- Script en español para la creación manual de la tabla de Paquetes / Casillero
-- Base de datos: PostgreSQL (Railway / Amairany Express)

CREATE TABLE IF NOT EXISTS "Package" (
    "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "cliente" VARCHAR(255) NOT NULL,
    "destino" VARCHAR(255) NOT NULL,
    "vendedorNombre" VARCHAR(255) NOT NULL,
    "valor" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "envio" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "total" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "telefono" VARCHAR(50) NOT NULL,
    "fechaEntrega" VARCHAR(50) NOT NULL,
    "imagenUrl" TEXT,
    "estado" VARCHAR(50) DEFAULT 'RECEPCIONADO' NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_package_search" ON "Package" ("cliente", "destino", "vendedorNombre", "telefono");
