-- ============================================================
-- Migración: Departamentos + Rol Coordinador (ajustada a estructura real)
-- Base de datos: stia_portal_clientes (schema casos)
-- ============================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. Agregar rol 'coordinador' a casos.users
--    Estructura actual: ('agente', 'colaborador', 'supervisor', 'admin')
-- ----------------------------------------------------------------
ALTER TABLE casos.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE casos.users ADD CONSTRAINT users_role_check
    CHECK (role IN ('agente', 'colaborador', 'supervisor', 'admin', 'coordinador'));

-- ----------------------------------------------------------------
-- 2. assigned_by_user_id en case_escalation_state (trazabilidad)
-- ----------------------------------------------------------------
ALTER TABLE casos.case_escalation_state
    ADD COLUMN IF NOT EXISTS assigned_by_user_id INT REFERENCES casos.users(id);

COMMIT;
