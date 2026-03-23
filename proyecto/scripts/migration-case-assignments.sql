-- ============================================================
-- Migración: Asignaciones de casos (usuarios no-técnicos SAP)
-- Base de datos: stia_portal_clientes (schema casos)
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS casos.case_assignments (
    id              SERIAL PRIMARY KEY,
    service_call_id INT          NOT NULL,
    country         VARCHAR(2)   NOT NULL,
    user_id         INT          NOT NULL REFERENCES casos.users(id) ON DELETE CASCADE,
    assigned_by_id  INT          REFERENCES casos.users(id) ON DELETE SET NULL,
    assigned_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_assignments_sc
    ON casos.case_assignments (service_call_id, country);

CREATE INDEX IF NOT EXISTS idx_case_assignments_user
    ON casos.case_assignments (user_id);

COMMIT;
