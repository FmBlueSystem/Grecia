CREATE TABLE IF NOT EXISTS casos.telemetry (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES casos.users(id),
  user_name VARCHAR(255),
  event VARCHAR(50) NOT NULL,
  page VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  duration_ms INTEGER,
  user_agent TEXT,
  ip_address VARCHAR(45),
  country VARCHAR(5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_created ON casos.telemetry(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_user ON casos.telemetry(user_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_event ON casos.telemetry(event);
