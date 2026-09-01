-- Script para la creación manual de la tabla de Clientes (Vendedores)
-- Base de datos: PostgreSQL (Railway / Amairany Express)

CREATE TABLE IF NOT EXISTS "Seller" (
    "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "nombre" VARCHAR(255) NOT NULL,
    "dui" VARCHAR(50),
    "tienda" VARCHAR(255),
    "correo" VARCHAR(255),
    "whatsapp" VARCHAR(50),
    "cuentaBancoAgricola" VARCHAR(100),
    "estado" VARCHAR(20) DEFAULT 'ACTIVO' NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Crear índice para acelerar búsquedas rápidas por nombre, tienda, whatsapp o dui
CREATE INDEX IF NOT EXISTS "idx_seller_search" ON "Seller" ("nombre", "tienda", "whatsapp", "dui");
