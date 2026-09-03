-- =============================================================
-- SCRIPT SQL: Creación de la Tabla Socio y Función generar_codigo_socio()
-- Función: generar_codigo_socio() -> Formato S-### (3 posiciones de 0-9A-Z)
-- Tabla: "Socio" con campos: id, codigo, nombre, telefono, correo, dui, ruta
-- Base de Datos: PostgreSQL (Amairany Express)
-- =============================================================

-- 1. Crear función para generar código único de socio (ej: S-3K8)
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

        -- Verificar que sea único en la tabla Socio
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

-- 2. Crear tabla "Socio"
CREATE TABLE IF NOT EXISTS "Socio" (
    "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "codigo" VARCHAR(20) UNIQUE DEFAULT generar_codigo_socio(),
    "nombre" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(50),
    "correo" VARCHAR(255),
    "dui" VARCHAR(50),
    "ruta" VARCHAR(50), -- Almacena el código de la ruta asignada (Ej: R-X92)
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Crear índices para optimizar búsquedas de socios
CREATE INDEX IF NOT EXISTS "idx_socio_codigo" ON "Socio" ("codigo");
CREATE INDEX IF NOT EXISTS "idx_socio_search" ON "Socio" ("nombre", "telefono", "dui", "ruta");

-- Comentarios explicativos
COMMENT ON TABLE "Socio" IS 'Tabla para el registro y mantenimiento de Socios / Repartidores con Ruta asignada';
COMMENT ON FUNCTION generar_codigo_socio() IS 'Genera un código único correlativo para socios con formato S-###';
COMMENT ON COLUMN "Socio"."codigo" IS 'Código único de socio (Ej: S-3K8)';
COMMENT ON COLUMN "Socio"."ruta" IS 'Código de la ruta asignada al socio (Ej: R-X92)';
