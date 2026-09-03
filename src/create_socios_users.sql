-- =============================================================
-- SCRIPT SQL: Creación de Usuarios de Plataforma para Socios
-- Asigna contraseña por defecto 'Socio2026!' y rol 'SOCIO'
-- Base de Datos: PostgreSQL (Amairany Express)
-- =============================================================

-- 1. Asegurar que la tabla "User" tenga soporte para correos únicos y rol 'SOCIO'
-- (Contraseña por defecto '$2a$10$7Z8q2W5Ew.4uO.jQ9eH0.O7wO0V3p8R71E8jK8T28r3eeP5w2hO21' que corresponde a 'Socio2026!')

INSERT INTO "User" ("id", "email", "password", "name", "role", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    LOWER(TRIM(s."correo")),
    '$2a$10$7Z8q2W5Ew.4uO.jQ9eH0.O7wO0V3p8R71E8jK8T28r3eeP5w2hO21', -- Hash bcrypt para 'Socio2026!'
    s."nombre",
    'SOCIO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Socio" s
WHERE s."correo" IS NOT NULL AND TRIM(s."correo") != ''
ON CONFLICT ("email") DO UPDATE 
SET "role" = 'SOCIO', "name" = EXCLUDED."name";

-- Comentario explicativo
COMMENT ON TABLE "User" IS 'Tabla de usuarios de acceso al sistema con roles ADMIN y SOCIO (Repartidor)';
