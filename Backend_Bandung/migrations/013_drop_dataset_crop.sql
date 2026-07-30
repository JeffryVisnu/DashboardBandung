-- Fitur crop (potong tampilan iframe secara vertikal) dibatalkan — buang kolomnya lagi.
ALTER TABLE sector_datasets
  DROP COLUMN IF EXISTS crop_top,
  DROP COLUMN IF EXISTS crop_bottom;
