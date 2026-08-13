-- Logo footer terpisah dari logo header — admin bisa upload logo berbeda buat footer (mis.
-- versi ikon saja tanpa wordmark) tanpa mengubah logo di header.
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS footer_logo_path TEXT;
