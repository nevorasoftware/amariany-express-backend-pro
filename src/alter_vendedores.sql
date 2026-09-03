-- =============================================================
-- SCRIPT SQL: Generador de Código de Vendedor / Cliente
-- Función: generar_codigo_vendedor() -> Formato V-### (3 posiciones de 0-9A-Z)
-- Modifica la tabla "Seller" para incluir la columna "codigo"
-- Base de Datos: PostgreSQL (Amairany Express)
-- =============================================================

-- 1. Crear función para generar código único de vendedor (ej: V-A1B)
CREATE OR REPLACE FUNCTION generar_codigo_vendedor()
RETURNS VARCHAR(5)
LANGUAGE plpgsql
AS $$
DECLARE
    v_codigo VARCHAR(5);
BEGIN
    LOOP
        v_codigo := 'V-' || (
            SELECT string_agg(
                substr('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 
                       floor(random() * 36 + 1)::int, 
                       1),
                ''
            )
            FROM generate_series(1, 3)
        );

        -- Verificar que sea único en la tabla Seller
        IF NOT EXISTS (
            SELECT 1
            FROM "Seller"
            WHERE "codigo" = v_codigo
        ) THEN
            RETURN v_codigo;
        END IF;
    END LOOP;
END;
$$;

-- 2. Agregar columna "codigo" a la tabla "Seller"
ALTER TABLE "Seller" 
ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(20) UNIQUE DEFAULT generar_codigo_vendedor();

-- 3. Asignar código automático a los vendedores existentes que no tengan código
UPDATE "Seller"
SET "codigo" = generar_codigo_vendedor()
WHERE "codigo" IS NULL OR "codigo" = '';

-- 4. Crear índice para optimizar búsquedas por código de vendedor
CREATE INDEX IF NOT EXISTS "idx_seller_codigo" ON "Seller" ("codigo");

-- Comentarios explicativos
COMMENT ON FUNCTION generar_codigo_vendedor() IS 'Genera un código único correlativo para vendedores con formato V-###';
COMMENT ON COLUMN "Seller"."codigo" IS 'Código único de vendedor (Ej: V-7A1)';
