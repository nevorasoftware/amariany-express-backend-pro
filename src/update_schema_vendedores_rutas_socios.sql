-- =============================================================
-- SCRIPT SQL CONSOLIDADO DE ACTUALIZACIÓN DE ESQUEMA Y CÓDIGOS (ROBUSTO / REPARADO)
-- Solución al error PostgreSQL XX001 (Corrupción/reindexación de archivo de bloque)
-- Incluye:
-- 1. generar_codigo_vendedor() -> Formato V-### y columna "codigo" en "Seller"
-- 2. generar_codigo_ruta()     -> Formato R-### y columna "codigo" en "RutaEntrega"
-- 3. generar_codigo_socio()    -> Formato S-### y creación de tabla "Socio" (id, codigo, nombre, telefono, correo, dui, ruta)
-- Base de datos: PostgreSQL (Railway / Amairany Express)
-- =============================================================

-- =============================================================
-- SECCIÓN 1: VENDEDORES / CLIENTES (generar_codigo_vendedor -> V-###)
-- =============================================================

-- 1.1 Crear/reemplazar la función del generador V-###
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

-- 1.2 Agregar columna sin restricción previa para evitar corrupción de índice
ALTER TABLE "Seller" ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(20);

-- 1.3 Asignar códigos únicos a vendedores existentes
UPDATE "Seller"
SET "codigo" = generar_codigo_vendedor()
WHERE "codigo" IS NULL OR "codigo" = '';

-- 1.4 Aplicar restricción de unicidad y valor por defecto
ALTER TABLE "Seller" ALTER COLUMN "codigo" SET DEFAULT generar_codigo_vendedor();

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Seller_codigo_key'
    ) THEN
        ALTER TABLE "Seller" ADD CONSTRAINT "Seller_codigo_key" UNIQUE ("codigo");
    END IF;
END $$;

-- 1.5 Reindexar la tabla Seller para resolver cualquier error de bloques corruptos (XX001)
REINDEX TABLE "Seller";


-- =============================================================
-- SECCIÓN 2: RUTAS DE ENTREGA (generar_codigo_ruta -> R-###)
-- =============================================================

-- 2.1 Crear/reemplazar la función del generador R-###
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

-- 2.2 Agregar columna
ALTER TABLE "RutaEntrega" ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(20);

-- 2.3 Asignar códigos únicos a rutas existentes
UPDATE "RutaEntrega"
SET "codigo" = generar_codigo_ruta()
WHERE "codigo" IS NULL OR "codigo" = '';

-- 2.4 Aplicar restricción de unicidad y valor por defecto
ALTER TABLE "RutaEntrega" ALTER COLUMN "codigo" SET DEFAULT generar_codigo_ruta();

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'RutaEntrega_codigo_key'
    ) THEN
        ALTER TABLE "RutaEntrega" ADD CONSTRAINT "RutaEntrega_codigo_key" UNIQUE ("codigo");
    END IF;
END $$;

-- 2.5 Reindexar la tabla RutaEntrega
REINDEX TABLE "RutaEntrega";


-- =============================================================
-- SECCIÓN 3: SOCIOS / REPARTIDORES (generar_codigo_socio -> S-### y Tabla Socio)
-- =============================================================

-- 3.1 Crear tabla Socio
CREATE TABLE IF NOT EXISTS "Socio" (
    "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "codigo" VARCHAR(20),
    "nombre" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(50),
    "correo" VARCHAR(255),
    "dui" VARCHAR(50),
    "ruta" VARCHAR(50),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3.2 Crear/reemplazar la función del generador S-###
CREATE OR REPLACE FUNCTION generar_codigo_socio()
RETURNS VARCHAR(5)
LANGUAGE plpgsql
AS $$
DECLARE
    v_codigo VARCHAR(5);
BEGIN
    LOOP
        v_codigo := 'S-' || (
            SELECT string_agg(
                substr('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 
                       floor(random() * 36 + 1)::int, 
                       1),
                ''
            )
            FROM generate_series(1, 3)
        );

        IF NOT EXISTS (
            SELECT 1
            FROM "Socio"
            WHERE "codigo" = v_codigo
        ) THEN
            RETURN v_codigo;
        END IF;
    END LOOP;
END;
$$;

-- 3.3 Asignar valor por defecto y restricción de unicidad
ALTER TABLE "Socio" ALTER COLUMN "codigo" SET DEFAULT generar_codigo_socio();

UPDATE "Socio"
SET "codigo" = generar_codigo_socio()
WHERE "codigo" IS NULL OR "codigo" = '';

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Socio_codigo_key'
    ) THEN
        ALTER TABLE "Socio" ADD CONSTRAINT "Socio_codigo_key" UNIQUE ("codigo");
    END IF;
END $$;

-- 3.4 Reindexar la tabla Socio
REINDEX TABLE "Socio";

-- =============================================================
-- PRUEBAS DE VERIFICACIÓN FINAL (Generación exitosa de códigos)
-- =============================================================
SELECT generar_codigo_vendedor() AS test_codigo_vendedor;
SELECT generar_codigo_ruta() AS test_codigo_ruta;
SELECT generar_codigo_socio() AS test_codigo_socio;
