-- =============================================================
-- SCRIPT ALTER SQL PARA LA TABLA Package
-- Agrega: "codigo" (VARCHAR 7 único) y "tipoPago" (EFECTIVO o TRANSFERENCIA)
-- Función: generar_codigo_paquete() en PostgreSQL
-- Base de Datos: PostgreSQL (Railway / Amairany Express)
-- =============================================================

-- 1. Crear función en PostgreSQL para generar código único (ej. P-A1B2C)
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

        -- Verificar que no exista en la tabla Package
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

-- 2. Agregar columna "codigo"
ALTER TABLE "Package" 
ADD COLUMN IF NOT EXISTS "codigo" VARCHAR(20) UNIQUE;

-- 3. Asignar código automático a los paquetes existentes que no tengan código
UPDATE "Package"
SET "codigo" = generar_codigo_paquete()
WHERE "codigo" IS NULL OR "codigo" = '';

-- 4. Agregar columna "tipoPago" (Valores permitidos: 'EFECTIVO' o 'TRANSFERENCIA')
ALTER TABLE "Package" 
ADD COLUMN IF NOT EXISTS "tipoPago" VARCHAR(50) DEFAULT 'EFECTIVO' NOT NULL;

-- 5. Agregar restricción CHECK para "tipoPago"
ALTER TABLE "Package" 
DROP CONSTRAINT IF EXISTS "chk_tipo_pago";

ALTER TABLE "Package" 
ADD CONSTRAINT "chk_tipo_pago" CHECK ("tipoPago" IN ('EFECTIVO', 'TRANSFERENCIA'));

-- 6. Crear índice para acelerar búsquedas por código y tipo de pago
CREATE INDEX IF NOT EXISTS "idx_package_codigo_pago" ON "Package" ("codigo", "tipoPago");

-- 7. Agregar columnas para fechaRecepcion, estadoLiquidacion y planillaId
ALTER TABLE "Package" 
ADD COLUMN IF NOT EXISTS "fechaRecepcion" VARCHAR(50);

ALTER TABLE "Package" 
ADD COLUMN IF NOT EXISTS "imagenEntregaUrl" TEXT;

ALTER TABLE "Package" 
ADD COLUMN IF NOT EXISTS "estadoLiquidacion" VARCHAR(50) DEFAULT 'PENDIENTE';

ALTER TABLE "Package" 
ADD COLUMN IF NOT EXISTS "planillaId" VARCHAR(100);

ALTER TABLE "Package" 
ADD COLUMN IF NOT EXISTS "fechaPagado" VARCHAR(50);

ALTER TABLE "Package" 
ADD COLUMN IF NOT EXISTS "fechaAbonado" VARCHAR(50);

-- 8. Crear tabla de Planillas para Liquidación
CREATE TABLE IF NOT EXISTS "Planilla" (
  "id" VARCHAR(100) PRIMARY KEY,
  "codigo" VARCHAR(50) UNIQUE NOT NULL,
  "fecha" VARCHAR(50) NOT NULL,
  "tipoPago" VARCHAR(50) DEFAULT 'TRANSFERENCIA',
  "montoTotal" DOUBLE PRECISION DEFAULT 0.0,
  "estado" VARCHAR(50) DEFAULT 'GENERADA',
  "detalleJson" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios explicativos
COMMENT ON COLUMN "Package"."codigo" IS 'Código único correlativo de paquete (Ej: P-A1B2C)';
COMMENT ON COLUMN "Package"."tipoPago" IS 'Tipo de pago al recepcionar: EFECTIVO o TRANSFERENCIA';
COMMENT ON COLUMN "Package"."imagenEntregaUrl" IS 'URL de la fotografía del comprobante de entrega o despacho';
COMMENT ON COLUMN "Package"."fechaRecepcion" IS 'Fecha de recepción en casillero';
COMMENT ON COLUMN "Package"."estadoLiquidacion" IS 'Estado de liquidación al vendedor: PENDIENTE, ABONADO, PROCESADA';
COMMENT ON COLUMN "Package"."fechaPagado" IS 'Fecha en que se liquida o paga en efectivo al vendedor';
COMMENT ON COLUMN "Package"."fechaAbonado" IS 'Fecha en que se realiza el abono por transferencia bancaria';
COMMENT ON TABLE "Planilla" IS 'Planillas de liquidación por fecha y tipo de pago';
