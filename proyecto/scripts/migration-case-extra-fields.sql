-- ============================================================
-- Migración: Campos extra de casos en PostgreSQL
-- Reemplaza los UDFs de SAP (U_SubEstado, U_IME_*, U_PortalUser)
-- Base de datos: stia_portal_clientes (schema casos)
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS casos.case_extra_fields (
  service_call_id   INT          NOT NULL,
  country           VARCHAR(2)   NOT NULL,
  -- S3
  sub_estado        VARCHAR(50),
  -- Portal
  portal_user       VARCHAR(100),
  -- S6: IME — vendedor
  ime_producto      VARCHAR(100),
  ime_cod_material  VARCHAR(50),
  ime_lote          VARCHAR(50),
  ime_factura       VARCHAR(50),
  ime_cant_inicial  NUMERIC,
  ime_cant_reclamo  NUMERIC,
  ime_reportado_por VARCHAR(100),
  -- S6: IME — calidad
  ime_cnsec_sgi          VARCHAR(20),
  ime_causa_reclamo      TEXT,
  ime_plan_accion        TEXT,
  ime_accion_correctiva  TEXT,
  ime_gestionado_por     VARCHAR(100),
  ime_verificado_por     VARCHAR(100),
  ime_fecha_verif        DATE,
  ime_retroalim          TEXT,
  ime_ventas_resp        VARCHAR(100),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (service_call_id, country)
);

COMMIT;
