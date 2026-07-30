-- Migration: permintaan akses API dari publik lewat formulir "Ajukan Permintaan API"
-- (/data-api/ajukan-akses). Admin meninjau & mengubah status lewat /eksekutif; penerbitan
-- key aktual tetap lewat fitur API key yang sudah ada.

CREATE TABLE IF NOT EXISTS api_requests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  website TEXT,
  email TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
