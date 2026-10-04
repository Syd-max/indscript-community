-- Add DELETE policies for admin on all user-submitted tables

CREATE POLICY "Admin can delete members"
  ON members FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can delete collaborations"
  ON collaborations FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can delete sponsorships"
  ON sponsorships FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can delete registrations"
  ON event_registrations FOR DELETE
  TO authenticated
  USING (is_admin());