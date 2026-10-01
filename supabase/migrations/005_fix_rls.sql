-- Berikan akses baca publik (anon) HANYA untuk komunitas yang sudah disetujui
CREATE POLICY "Public Ecosystem Access" 
ON members 
FOR SELECT 
USING (
  status = 'approved' AND community_name IS NOT NULL
);