-- =============================================================
-- Migration: Sistema de Escalamiento y Departamentos
-- Portal Casos STIA - casos.stia.net
-- Ejecutar con: psql -U postgres -d stia_portal_clientes -f migration-escalation.sql
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- 1. casos.departments
-- Mapea a los valores de dropdown_area en casos.settings
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS casos.departments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  chief_user_id INTEGER REFERENCES casos.users(id) ON DELETE SET NULL,
  country VARCHAR(2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_department_name_country UNIQUE (name, country)
);

CREATE INDEX IF NOT EXISTS idx_departments_country ON casos.departments(country);
CREATE INDEX IF NOT EXISTS idx_departments_active ON casos.departments(active) WHERE active = true;

-- -------------------------------------------------------------
-- 2. casos.department_members
-- Asigna usuarios a departamentos con rol supervisor o agente
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS casos.department_members (
  department_id INTEGER NOT NULL REFERENCES casos.departments(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES casos.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('supervisor', 'agente')),
  PRIMARY KEY (department_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_dept_members_user ON casos.department_members(user_id);

-- -------------------------------------------------------------
-- 3. casos.escalation_rules
-- Umbrales de escalamiento por prioridad (y opcionalmente por pais)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS casos.escalation_rules (
  id SERIAL PRIMARY KEY,
  priority VARCHAR(10) NOT NULL CHECK (priority IN ('Alta', 'Normal', 'Baja')),
  level_1_pct INTEGER NOT NULL DEFAULT 75,
  level_2_pct INTEGER NOT NULL DEFAULT 100,
  level_3_minutes INTEGER NOT NULL DEFAULT 120,
  notify_email BOOLEAN NOT NULL DEFAULT true,
  notify_in_app BOOLEAN NOT NULL DEFAULT true,
  notify_whatsapp BOOLEAN NOT NULL DEFAULT false,
  country VARCHAR(2),
  CONSTRAINT uq_escalation_priority_country UNIQUE (priority, country)
);

-- -------------------------------------------------------------
-- 4. ALTER casos.escalation_logs
-- Agregar columnas para tracking de usuario notificado y reconocimiento
-- Columnas existentes: id, case_id, country, level, action, notified_to, created_at
-- -------------------------------------------------------------
ALTER TABLE casos.escalation_logs
  ADD COLUMN IF NOT EXISTS notified_user_id INTEGER REFERENCES casos.users(id),
  ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ;

-- Indice para buscar logs no reconocidos
CREATE INDEX IF NOT EXISTS idx_escalation_logs_pending
  ON casos.escalation_logs(case_id, country)
  WHERE acknowledged_at IS NULL;

-- Indice para dedup por nivel y usuario
CREATE UNIQUE INDEX IF NOT EXISTS uq_escalation_case_level_user
  ON casos.escalation_logs(case_id, country, level, notified_user_id)
  WHERE notified_user_id IS NOT NULL;

-- -------------------------------------------------------------
-- 5. ALTER casos.users
-- Agregar telefono WhatsApp para notificaciones
-- -------------------------------------------------------------
ALTER TABLE casos.users
  ADD COLUMN IF NOT EXISTS whatsapp_phone VARCHAR(20);

-- -------------------------------------------------------------
-- 6. casos.notifications
-- Notificaciones in-app para el sistema de campana
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS casos.notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES casos.users(id) ON DELETE CASCADE,
  case_id INTEGER,
  country VARCHAR(2),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(30) NOT NULL DEFAULT 'info'
    CHECK (type IN ('sla_warning', 'sla_exceeded', 'escalation', 'assignment', 'info')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON casos.notifications(user_id, created_at DESC)
  WHERE read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_user_all
  ON casos.notifications(user_id, created_at DESC);

-- -------------------------------------------------------------
-- 7. Seed: escalation_rules con valores por defecto
-- ON CONFLICT DO NOTHING para que sea idempotente
-- -------------------------------------------------------------
INSERT INTO casos.escalation_rules (priority, level_1_pct, level_2_pct, level_3_minutes, notify_email, notify_in_app, notify_whatsapp, country)
VALUES
  ('Alta',   60,  90, 60,  true, true, false, NULL),
  ('Normal', 75, 100, 120, true, true, false, NULL),
  ('Baja',   85, 100, 240, true, true, false, NULL)
ON CONFLICT (priority, country) DO NOTHING;

COMMIT;
