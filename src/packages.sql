-- Script para la creación manual de la tabla de Paquetes / Casillero
-- Base de datos: PostgreSQL (Railway / Amairany Express)

CREATE OR REPLACE FUNCTION generar_codigo_paquete()
RETURNS VARCHAR(7)
LANGUAGE plpgsql
AS $$
DECLARE
    v_codigo VARCHAR(7);
BEGIN
    LOOP
        v_codigo := 'P-' || (
            SELECT string_agg(
                substr('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 
                       floor(random() * 36 + 1)::int, 
                       1),
                ''
            )
            FROM generate_series(1, 5)
        );

        IF NOT EXISTS (
            SELECT 1
            FROM "Package"
            WHERE "codigo" = v_codigo
        ) THEN
            RETURN v_codigo;
        END IF;
    END LOOP;
END;
$$;

CREATE TABLE IF NOT EXISTS "Package" (
    "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "codigo" VARCHAR(20) UNIQUE DEFAULT generar_codigo_paquete(),
    "cliente" VARCHAR(255) NOT NULL,
    "destino" VARCHAR(255) NOT NULL,
    "vendedorNombre" VARCHAR(255) NOT NULL,
    "valor" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "envio" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "total" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    "telefono" VARCHAR(50) NOT NULL,
    "fechaEntrega" VARCHAR(50) NOT NULL,
    "imagenUrl" TEXT,
    "tipoPago" VARCHAR(50) DEFAULT 'EFECTIVO' NOT NULL CHECK ("tipoPago" IN ('EFECTIVO', 'TRANSFERENCIA')),
    "estado" VARCHAR(50) DEFAULT 'RECEPCIONADO' NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Crear índice para acelerar búsquedas rápidas por cliente, destino, vendedorNombre, código o teléfono
CREATE INDEX IF NOT EXISTS "idx_package_search" ON "Package" ("codigo", "cliente", "destino", "vendedorNombre", "telefono", "tipoPago");

-- Comentarios explicativos
COMMENT ON TABLE "Package" IS 'Tabla para el registro e ingreso de paquetes (Casillero) en Amairany Express';
COMMENT ON COLUMN "Package"."codigo" IS 'Código de paquete único (Ej: P-A1B2C)';
COMMENT ON COLUMN "Package"."tipoPago" IS 'Tipo de pago al recepcionar: EFECTIVO o TRANSFERENCIA';
COMMENT ON COLUMN "Package"."estado" IS 'Estado del paquete: RECEPCIONADO, EN RUTA, ENTREGADO, CANCELADO';
