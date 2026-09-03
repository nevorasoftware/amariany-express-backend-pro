-- =============================================================
-- SCRIPT SQL: Soporte para Múltiples Rutas por Socio
-- Modifica la tabla "Socio" para agregar la columna "rutas" y migrar datos
-- Base de Datos: PostgreSQL (Amairany Express)
-- =============================================================

-- 1. Agregar columna "rutas" a la tabla "Socio"
ALTER TABLE "Socio" 
ADD COLUMN IF NOT EXISTS "rutas" TEXT;

-- 2. Migrar la ruta existente hacia la columna de lista de rutas
UPDATE "Socio"
SET "rutas" = "ruta"
WHERE ("rutas" IS NULL OR "rutas" = '') AND "ruta" IS NOT NULL AND "ruta" != '';

-- 3. Crear índice para optimizar búsquedas por lista de rutas
CREATE INDEX IF NOT EXISTS "idx_socio_rutas" ON "Socio" ("rutas");

-- Comentario explicativo
COMMENT ON COLUMN "Socio"."rutas" IS 'Lista de códigos o nombres de rutas asignadas al socio separadas por coma (Ej: R-A1B, R-X92)';
