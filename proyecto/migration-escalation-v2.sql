-- ============================================================
-- Migración: Sistema de Escalamiento v2
-- Base de datos: stia_portal_clientes (schema casos)
-- ============================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. business_hours
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS casos.business_hours (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL,
    timezone    VARCHAR(50)  NOT NULL DEFAULT 'America/Costa_Rica',
    workdays    VARCHAR(20)  NOT NULL DEFAULT '1,2,3,4,5',  -- 1=Lun, 7=Dom
    start_time  TIME         NOT NULL DEFAULT '08:00',
    end_time    TIME         NOT NULL DEFAULT '17:00',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 2. business_hours_exceptions (feriados / días especiales)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS casos.business_hours_exceptions (
    id                  SERIAL PRIMARY KEY,
    business_hours_id   INT     NOT NULL REFERENCES casos.business_hours(id) ON DELETE CASCADE,
    exception_date      DATE    NOT NULL,
    is_working_day      BOOLEAN NOT NULL DEFAULT FALSE,
    start_time          TIME,
    end_time            TIME,
    description         VARCHAR(100),
    UNIQUE(business_hours_id, exception_date)
);

-- ----------------------------------------------------------------
-- 3. sla_definitions
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS casos.sla_definitions (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    priority_label      VARCHAR(10)  NOT NULL,           -- Alta / Normal / Baja
    response_time_min   INT          NOT NULL DEFAULT 240,
    resolution_time_min INT          NOT NULL DEFAULT 1440,
    business_hours_id   INT          REFERENCES casos.business_hours(id),
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE(priority_label)
);

-- ----------------------------------------------------------------
-- 4. notification_templates
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS casos.notification_templates (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    channel     VARCHAR(20)  NOT NULL DEFAULT 'email',   -- email | sms | push
    subject     VARCHAR(255),
    body        TEXT         NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 5. escalation_policies
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS casos.escalation_policies (
    id                          SERIAL PRIMARY KEY,
    name                        VARCHAR(100) NOT NULL,
    description                 TEXT,
    is_active                   BOOLEAN      NOT NULL DEFAULT TRUE,
    escalation_type             VARCHAR(20)  NOT NULL DEFAULT 'resolution', -- response | resolution | both
    count_only_business_hours   BOOLEAN      NOT NULL DEFAULT FALSE,
    max_renotify_count          INT          NOT NULL DEFAULT 3,
    renotify_interval_min       INT          NOT NULL DEFAULT 60,
    reset_policy                VARCHAR(20)  NOT NULL DEFAULT 'none',  -- none | full | one_level | on_response
    pause_on_status             VARCHAR(100),                          -- CSV: "pending_client,pending_vendor"
    priority_weight             DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    created_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 6. escalation_levels
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS casos.escalation_levels (
    id              SERIAL PRIMARY KEY,
    policy_id       INT         NOT NULL REFERENCES casos.escalation_policies(id) ON DELETE CASCADE,
    level_order     INT         NOT NULL,           -- 0, 1, 2, 3…
    name            VARCHAR(50) NOT NULL,
    time_window_min INT         NOT NULL,           -- minutos vencidos acumulados para disparar este nivel
    action_type     VARCHAR(20) NOT NULL DEFAULT 'notify',  -- notify | reassign | notify_reassign
    reassign_to     VARCHAR(100),                   -- user_id, role, o "supervisor"
    template_id     INT         REFERENCES casos.notification_templates(id),
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    UNIQUE(policy_id, level_order)
);

-- ----------------------------------------------------------------
-- 7. escalation_contacts (quién recibe en cada nivel)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS casos.escalation_contacts (
    id              SERIAL PRIMARY KEY,
    level_id        INT         NOT NULL REFERENCES casos.escalation_levels(id) ON DELETE CASCADE,
    contact_type    VARCHAR(20) NOT NULL,  -- user | role | group | case_owner
    contact_ref     VARCHAR(100) NOT NULL, -- user_id, "supervisor", "admin", dept_id
    channel         VARCHAR(20) NOT NULL DEFAULT 'email',  -- email | in_app | whatsapp
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE
);

-- ----------------------------------------------------------------
-- 8. case_escalation_state
--    Estado de escalamiento por caso SAP (ya que casos viven en SAP)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS casos.case_escalation_state (
    id                          SERIAL PRIMARY KEY,
    sap_case_id                 INT          NOT NULL,
    country                     VARCHAR(5)   NOT NULL,

    -- SLA de resolución
    resolution_policy_id        INT          REFERENCES casos.escalation_policies(id),
    resolution_level            INT          NOT NULL DEFAULT 0,
    resolution_escalated_at     TIMESTAMPTZ,
    resolution_renotify_count   INT          NOT NULL DEFAULT 0,
    resolution_deadline         TIMESTAMPTZ,

    -- SLA de respuesta
    response_policy_id          INT          REFERENCES casos.escalation_policies(id),
    response_level              INT          NOT NULL DEFAULT 0,
    response_escalated_at       TIMESTAMPTZ,
    response_renotify_count     INT          NOT NULL DEFAULT 0,
    response_deadline           TIMESTAMPTZ,
    first_response_at           TIMESTAMPTZ,

    -- Pausa
    escalation_paused           BOOLEAN      NOT NULL DEFAULT FALSE,
    paused_at                   TIMESTAMPTZ,
    total_paused_min            INT          NOT NULL DEFAULT 0,

    created_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    UNIQUE(sap_case_id, country)
);

CREATE INDEX IF NOT EXISTS idx_ces_resolution_scan
    ON casos.case_escalation_state(country, resolution_deadline, resolution_policy_id)
    WHERE resolution_level >= 0 AND escalation_paused = FALSE;

CREATE INDEX IF NOT EXISTS idx_ces_response_scan
    ON casos.case_escalation_state(country, response_deadline, response_policy_id)
    WHERE first_response_at IS NULL AND escalation_paused = FALSE;

-- ----------------------------------------------------------------
-- 9. Evolucionar escalation_logs existente (agregar columnas v2)
-- ----------------------------------------------------------------
ALTER TABLE casos.escalation_logs
    ADD COLUMN IF NOT EXISTS escalation_type  VARCHAR(20)  DEFAULT 'resolution',
    ADD COLUMN IF NOT EXISTS from_level       INT          DEFAULT 0,
    ADD COLUMN IF NOT EXISTS to_level         INT          DEFAULT 1,
    ADD COLUMN IF NOT EXISTS time_overdue_min INT          DEFAULT 0,
    ADD COLUMN IF NOT EXISTS triggered_by     VARCHAR(20)  DEFAULT 'system',
    ADD COLUMN IF NOT EXISTS notified_to_v2   JSONB;

-- ----------------------------------------------------------------
-- 10. Seed: business_hours para 5 países
-- ----------------------------------------------------------------
INSERT INTO casos.business_hours (name, timezone, workdays, start_time, end_time)
VALUES
    ('Horario CR',  'America/Costa_Rica',    '1,2,3,4,5', '08:00', '17:00'),
    ('Horario SV',  'America/El_Salvador',   '1,2,3,4,5', '08:00', '17:00'),
    ('Horario GT',  'America/Guatemala',     '1,2,3,4,5', '08:00', '17:00'),
    ('Horario HN',  'America/Tegucigalpa',   '1,2,3,4,5', '08:00', '17:00'),
    ('Horario PA',  'America/Panama',        '1,2,3,4,5', '08:00', '17:00'),
    ('24/7',        'UTC',                   '1,2,3,4,5,6,7', '00:00', '23:59')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- 11. Seed: sla_definitions (mapeo directo a U_TiempoEst SAP)
-- ----------------------------------------------------------------
INSERT INTO casos.sla_definitions (name, priority_label, response_time_min, resolution_time_min, business_hours_id)
VALUES
    ('SLA Alta',   'Alta',   60,   480,  1),   -- 1h respuesta, 8h resolución
    ('SLA Normal', 'Normal', 240,  1440, 1),   -- 4h respuesta, 24h resolución
    ('SLA Baja',   'Baja',   480,  2880, 1)    -- 8h respuesta, 48h resolución
ON CONFLICT (priority_label) DO NOTHING;

-- ----------------------------------------------------------------
-- 12. Seed: notification_templates
-- ----------------------------------------------------------------
INSERT INTO casos.notification_templates (name, channel, subject, body)
VALUES
    ('esc_nivel1_email', 'email',
     '[ALERTA SLA] Caso {reference_code} - {level_name}',
     'Caso {reference_code}: {subject}\nPrioridad: {priority}\nVencido hace {time_overdue} min\nAsignado a: {assigned_to}\nNivel de escalamiento: {level_name}'),
    ('esc_nivel2_email', 'email',
     '[ESCALAMIENTO] Caso {reference_code} - {level_name}',
     'Caso {reference_code}: {subject}\nPrioridad: {priority}\nVencido hace {time_overdue} min\nSe requiere acción inmediata - Nivel: {level_name}'),
    ('esc_nivel3_email', 'email',
     '[CRÍTICO] Caso {reference_code} - Escalado a Gerencia',
     'Caso {reference_code}: {subject}\nPrioridad: {priority}\nVencido hace {time_overdue} min\nEscalado a nivel gerencial. Se requiere resolución urgente.'),
    ('esc_renotify_email', 'email',
     '[RE-NOTIFICACIÓN] Caso {reference_code} sigue sin resolver',
     'Recordatorio: El caso {reference_code} ({subject}) sigue sin resolver.\nVencido hace {time_overdue} min. Nivel: {level_name}'),
    ('esc_nivel1_inapp', 'push',
     NULL,
     'SLA al {sla_pct}% - Caso {reference_code}: {subject}'),
    ('esc_nivel2_inapp', 'push',
     NULL,
     'SLA EXCEDIDO - Caso {reference_code}: {subject} ({time_overdue} min vencido)')
ON CONFLICT (name) DO NOTHING;

-- ----------------------------------------------------------------
-- 13. Seed: escalation_policies y niveles
-- ----------------------------------------------------------------

-- Política resolución (reemplaza escalation_rules v1)
INSERT INTO casos.escalation_policies
    (name, description, escalation_type, count_only_business_hours, max_renotify_count, renotify_interval_min, reset_policy)
VALUES
    ('Resolución Estándar', 'Política principal para SLA de resolución', 'resolution', FALSE, 3, 60, 'none'),
    ('Respuesta Estándar',  'Política para SLA de primera respuesta',    'response',   FALSE, 2, 30, 'none')
ON CONFLICT DO NOTHING;

-- Niveles para "Resolución Estándar" (policy id 1)
INSERT INTO casos.escalation_levels (policy_id, level_order, name, time_window_min, action_type, template_id)
SELECT
    p.id, 0, 'Alerta Agente',   0,   'notify', t1.id
FROM casos.escalation_policies p
CROSS JOIN casos.notification_templates t1
WHERE p.name = 'Resolución Estándar' AND t1.name = 'esc_nivel1_email'
ON CONFLICT (policy_id, level_order) DO NOTHING;

INSERT INTO casos.escalation_levels (policy_id, level_order, name, time_window_min, action_type, template_id)
SELECT
    p.id, 1, 'Escalado a Líder', 120, 'notify', t.id
FROM casos.escalation_policies p
CROSS JOIN casos.notification_templates t
WHERE p.name = 'Resolución Estándar' AND t.name = 'esc_nivel2_email'
ON CONFLICT (policy_id, level_order) DO NOTHING;

INSERT INTO casos.escalation_levels (policy_id, level_order, name, time_window_min, action_type, template_id)
SELECT
    p.id, 2, 'Escalado a Gerencia', 240, 'notify_reassign', t.id
FROM casos.escalation_policies p
CROSS JOIN casos.notification_templates t
WHERE p.name = 'Resolución Estándar' AND t.name = 'esc_nivel3_email'
ON CONFLICT (policy_id, level_order) DO NOTHING;

-- Niveles para "Respuesta Estándar" (policy id 2)
INSERT INTO casos.escalation_levels (policy_id, level_order, name, time_window_min, action_type, template_id)
SELECT
    p.id, 0, 'Alerta Sin Respuesta', 0, 'notify', t.id
FROM casos.escalation_policies p
CROSS JOIN casos.notification_templates t
WHERE p.name = 'Respuesta Estándar' AND t.name = 'esc_nivel1_inapp'
ON CONFLICT (policy_id, level_order) DO NOTHING;

INSERT INTO casos.escalation_levels (policy_id, level_order, name, time_window_min, action_type, template_id)
SELECT
    p.id, 1, 'Sin Respuesta - Supervisor', 30, 'notify', t.id
FROM casos.escalation_policies p
CROSS JOIN casos.notification_templates t
WHERE p.name = 'Respuesta Estándar' AND t.name = 'esc_nivel2_inapp'
ON CONFLICT (policy_id, level_order) DO NOTHING;

-- Contactos: nivel 0 notifica a case_owner y role=supervisor
INSERT INTO casos.escalation_contacts (level_id, contact_type, contact_ref, channel)
SELECT l.id, 'case_owner', 'assigned_technician', 'email'
FROM casos.escalation_levels l
JOIN casos.escalation_policies p ON l.policy_id = p.id
WHERE p.name = 'Resolución Estándar' AND l.level_order = 0
ON CONFLICT DO NOTHING;

INSERT INTO casos.escalation_contacts (level_id, contact_type, contact_ref, channel)
SELECT l.id, 'case_owner', 'assigned_technician', 'in_app'
FROM casos.escalation_levels l
JOIN casos.escalation_policies p ON l.policy_id = p.id
WHERE p.name = 'Resolución Estándar' AND l.level_order = 0
ON CONFLICT DO NOTHING;

INSERT INTO casos.escalation_contacts (level_id, contact_type, contact_ref, channel)
SELECT l.id, 'role', 'supervisor', 'email'
FROM casos.escalation_levels l
JOIN casos.escalation_policies p ON l.policy_id = p.id
WHERE p.name = 'Resolución Estándar' AND l.level_order = 1
ON CONFLICT DO NOTHING;

INSERT INTO casos.escalation_contacts (level_id, contact_type, contact_ref, channel)
SELECT l.id, 'role', 'admin', 'email'
FROM casos.escalation_levels l
JOIN casos.escalation_policies p ON l.policy_id = p.id
WHERE p.name = 'Resolución Estándar' AND l.level_order = 2
ON CONFLICT DO NOTHING;

COMMIT;
