-- Create the database separately first, e.g. createdb cadd_db
-- Then run: psql -d cadd_db -f database/schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'farmer'
    CHECK (role IN ('farmer', 'agronomist', 'researcher')),
  district VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  original_filename TEXT,
  notes TEXT,
  disease_name VARCHAR(160) NOT NULL,
  confidence NUMERIC(7,6) NOT NULL DEFAULT 0
    CHECK (confidence >= 0 AND confidence <= 1),
  recommendation TEXT,
  all_scores JSONB,
  raw_ai_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_user_created
  ON predictions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_predictions_disease
  ON predictions(disease_name);
