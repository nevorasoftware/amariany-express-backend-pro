-- =============================================================
-- SCRIPT SQL: Generador de Código de Ruta de Entrega
-- Función: generar_codigo_ruta() -> Formato R-### (3 posiciones de 0-9A-Z)
-- Modifica la tabla "RutaEntrega" para incluir la columna "codigo"
-- Base de Datos: PostgreSQL (Amairany Express)
-- =============================================================

-- 1. Crear función para generar código único de ruta (ej: R-X92)
CREATE OR REPLACE FUNCTION generar_codigo_ruta()
RETURNS VARCHAR(5)
LANGUAGE plpgsql
AS $$
DECLARE
    v_codigo VARCHAR(5);
BEGIN
    LOOP
        v_codigo := 'R-' || (
            SELECT string_agg(
                substr('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 
                       floor(random() * 36 + 1)::int, 
                       1),
                ''
            )
            FROM generate_series(1, 3)
        );

        -- Verificar que sea único en la tabla RutaEntrega
        IF NOT EXISTS (
            SELECT 1
            FROM "RutaEntrega"
            WHERE "codigo" = v_codigo
        ) THEN
            RETURN v_codigo;
        END IF;
    END LOOP;
END;
$$;

-- 2. Agregar columna "codigo" a la tabla "RutaEntrega"
ALTER TABLE "RutaEntrega" 
ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(20) UNIQUE DEFAULT generar_codigo_ruta();

-- 3. Asignar código automático a las rutas existentes que no tengan código
UPDATE "RutaEntrega"
SET "codigo" = generar_codigo_ruta()
WHERE "codigo" IS NULL OR "codigo" = '';

-- 4. Crear índice para optimizar búsquedas por código de ruta
CREATE INDEX IF NOT EXISTS "idx_ruta_codigo" ON "RutaEntrega" ("codigo");

-- Comentarios explicativos
COMMENT ON FUNCTION generar_codigo_ruta() IS 'Genera un código único correlativo para rutas de entrega con formato R-###';
COMMENT ON COLUMN "RutaEntrega"."codigo" IS 'Código único de ruta (Ej: R-X92)';
