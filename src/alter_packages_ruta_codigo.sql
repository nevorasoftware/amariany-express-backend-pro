-- =============================================================
-- SCRIPT SQL: AGREGAR COLUMNA "rutaCodigo" A LA TABLA "Package"
-- Permite la relación directa entre el paquete y la ruta del socio
-- Base de Datos: PostgreSQL (Amairany Express)
-- =============================================================

-- 1. Agregar columna "rutaCodigo" si no existe
ALTER TABLE "Package" 
ADD COLUMN IF NOT EXISTS "rutaCodigo" TEXT;

-- 2. Poblar/Migrar automáticamente el código de ruta (formato R-###) en paquetes existentes
UPDATE "Package" p
SET "rutaCodigo" = (
    SELECT r."codigo" 
    FROM "RutaEntrega" r 
    WHERE (p."destino" ILIKE '%' || r."codigo" || '%')
       OR (p."destino" ILIKE '%' || r."lugarPrincipal" || '%')
    LIMIT 1
)
WHERE p."rutaCodigo" IS NULL;

-- 3. Crear índice para optimizar consultas de despacho por socio
CREATE INDEX IF NOT EXISTS "idx_package_ruta_codigo" ON "Package"("rutaCodigo");

-- Comentario explicativo
COMMENT ON COLUMN "Package"."rutaCodigo" IS 'Código correlativo de la ruta (Ej: R-OJB) para filtrado directo por socio';
