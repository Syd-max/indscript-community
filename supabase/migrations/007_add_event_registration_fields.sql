ALTER TABLE event_registrations 
  ADD COLUMN IF NOT EXISTS institution_type TEXT,
  ADD COLUMN IF NOT EXISTS institution_type_other TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT;