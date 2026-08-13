-- Isi halaman "Ketentuan Penggunaan" & "Kebijakan Privasi" — HTML hasil WYSIWYG editor admin,
-- ditampilkan apa adanya (dangerouslySetInnerHTML) di halaman publik terkait.
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS ketentuan_penggunaan TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS kebijakan_privasi TEXT NOT NULL DEFAULT '';
