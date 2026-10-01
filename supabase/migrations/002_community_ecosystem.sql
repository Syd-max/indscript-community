-- =========================================================================
-- 1. ADD NEW FIELDS TO MEMBERS TABLE
-- =========================================================================
ALTER TABLE members
ADD COLUMN IF NOT EXISTS community_name TEXT,
ADD COLUMN IF NOT EXISTS relationship_type TEXT DEFAULT 'community_under_indscript',
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS profile TEXT,
ADD COLUMN IF NOT EXISTS member_count TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS is_highlighted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

UPDATE members SET updated_at = created_at WHERE updated_at IS NULL;

-- =========================================================================
-- 2. SEED INITIAL VERIFIED COMMUNITIES
-- =========================================================================
-- Note: We use 'name' for Leader/Management (as mapped) and 'community_name' for the Community.

DO $do
BEGIN
    -- 1. IIDN
    IF NOT EXISTS (SELECT 1 FROM members WHERE community_name = 'IIDN — Ibu-Ibu Doyan Nulis') THEN
        INSERT INTO members (community_name, name, email, phone, domicile, occupation, interest, reason, status, relationship_type, category, profile, member_count, is_highlighted)
        VALUES ('IIDN — Ibu-Ibu Doyan Nulis', 'Novi Herdiani — Ketua Umum 2026', '-', '-', 'Indonesia / International', '-', '-', '-', 'approved', 'community_under_indscript', 'Writing & Literacy', 'Community focused on writing, literacy, writer development, and productivity.', '14891+', false);
    END IF;

    -- 2. IIDB
    IF NOT EXISTS (SELECT 1 FROM members WHERE community_name = 'IIDB — Ibu-Ibu Doyan Bisnis') THEN
        INSERT INTO members (community_name, name, email, phone, domicile, occupation, interest, reason, status, relationship_type, category, profile, member_count, is_highlighted)
        VALUES ('IIDB — Ibu-Ibu Doyan Bisnis', 'Fenny Solehati — Ketua Umum 2026', '-', '-', '72 titik Indonesia', '-', '-', '-', 'approved', 'community_under_indscript', 'Business & Women''s Empowerment', 'Community for women focused on business development, business sharing, employment opportunities, and women''s empowerment.', '1300+', false);
    END IF;

    -- 3. Komunitas Guru Inspiratif
    IF NOT EXISTS (SELECT 1 FROM members WHERE community_name = 'Komunitas Guru Inspiratif') THEN
        INSERT INTO members (community_name, name, email, phone, domicile, occupation, interest, reason, status, relationship_type, category, profile, member_count, is_highlighted)
        VALUES ('Komunitas Guru Inspiratif', 'Leni Nurindah — Pengelola', '-', '-', 'Indonesia', '-', '-', '-', 'approved', 'community_under_indscript', 'Education & Literacy', 'Community for teachers focused on writing, learning, educational activities, and professional development.', '600+', false);
    END IF;

    -- 4. Nulis Jadi Duit (NJD)
    IF NOT EXISTS (SELECT 1 FROM members WHERE community_name = 'Nulis Jadi Duit (NJD)') THEN
        INSERT INTO members (community_name, name, email, phone, domicile, occupation, interest, reason, status, relationship_type, category, profile, instagram_url, is_highlighted)
        VALUES ('Nulis Jadi Duit (NJD)', '-', '-', '-', 'Indonesia', '-', '-', '-', 'approved', 'community_under_indscript', 'Writing, Professional & Business', 'Community for professionals, public figures, and entrepreneurs interested in turning writing and knowledge into meaningful work, opportunities, and impact.', 'https://www.instagram.com/nulisjadiduit/', false);
    END IF;

    -- 5. Millionaire Writer
    IF NOT EXISTS (SELECT 1 FROM members WHERE community_name = 'Millionaire Writer') THEN
        INSERT INTO members (community_name, name, email, phone, domicile, occupation, interest, reason, status, relationship_type, category, profile, is_highlighted)
        VALUES ('Millionaire Writer', '-', '-', '-', 'Indonesia', '-', '-', '-', 'approved', 'community_under_indscript', 'Writing & Business', 'Community within the verified Indscript ecosystem focused on writing and business.', false);
    END IF;

    -- 6. KNP
    IF NOT EXISTS (SELECT 1 FROM members WHERE community_name = 'KNP') THEN
        INSERT INTO members (community_name, name, email, phone, domicile, occupation, interest, reason, status, relationship_type, category, profile, is_highlighted)
        VALUES ('KNP', '-', '-', '-', 'Indonesia', '-', '-', '-', 'approved', 'community_under_indscript', 'Community / Professional', 'KNP is identified by Indscript as one of the communities within the Indscript Holding ecosystem.', false);
    END IF;

    -- 7. Pensiun Inspiratif
    IF NOT EXISTS (SELECT 1 FROM members WHERE community_name = 'Pensiun Inspiratif') THEN
        INSERT INTO members (community_name, name, email, phone, domicile, occupation, interest, reason, status, relationship_type, category, profile, is_highlighted)
        VALUES ('Pensiun Inspiratif', '-', '-', '-', 'Indonesia', '-', '-', '-', 'approved', 'community_under_indscript', 'Community / Empowerment', 'Community within the Indscript ecosystem focused on productive and meaningful activities for people in retirement.', false);
    END IF;

    -- 8. BSB — Bank Sampah Bersinar
    IF NOT EXISTS (SELECT 1 FROM members WHERE community_name = 'BSB — Bank Sampah Bersinar') THEN
        INSERT INTO members (community_name, name, email, phone, domicile, occupation, interest, reason, status, relationship_type, category, profile, instagram_url, is_highlighted)
        VALUES ('BSB — Bank Sampah Bersinar', 'Fifie Raharja — Founder', '-', '-', 'Bandung, Jawa Barat', '-', '-', '-', 'approved', 'community_under_indscript', 'Environment & Community Empowerment', 'Community/organization focused on waste management, environmental education, community empowerment, and environmental sustainability.', 'https://www.instagram.com/banksampahbersinar.id/', false);
    END IF;

    -- 9. Nasabah Naisar
    IF NOT EXISTS (SELECT 1 FROM members WHERE community_name = 'Nasabah Naisar') THEN
        INSERT INTO members (community_name, name, email, phone, domicile, occupation, interest, reason, status, relationship_type, category, profile, is_highlighted)
        VALUES ('Nasabah Naisar', '-', '-', '-', 'Indonesia', '-', '-', '-', 'approved', 'community_under_indscript', 'Business / Community', 'Community identified by Indscript as part of the Holding Indscript ecosystem.', false);
    END IF;

    -- 10. Sekolah Perempuan
    IF NOT EXISTS (SELECT 1 FROM members WHERE community_name = 'Sekolah Perempuan') THEN
        INSERT INTO members (community_name, name, email, phone, domicile, occupation, interest, reason, status, relationship_type, category, profile, instagram_url, is_highlighted)
        VALUES ('Sekolah Perempuan', '-', '-', '-', 'Indonesia', '-', '-', '-', 'approved', 'community_under_indscript', 'Women''s Empowerment', 'Community/program focused on women''s development, empowerment, learning, and productive activities.', 'https://www.instagram.com/sekolahperempuan.id/', false);
    END IF;

    -- 11. KADIN Indonesia
    IF NOT EXISTS (SELECT 1 FROM members WHERE community_name = 'KADIN Indonesia') THEN
        INSERT INTO members (community_name, name, email, phone, domicile, occupation, interest, reason, status, relationship_type, category, profile, is_highlighted)
        VALUES ('KADIN Indonesia', '-', '-', '-', 'Indonesia', '-', '-', '-', 'approved', 'strategic_partner', 'Business / Chamber of Commerce', 'Kamar Dagang dan Industri Indonesia and its business ecosystem.', false);
    END IF;

    -- 12. IWAPI
    IF NOT EXISTS (SELECT 1 FROM members WHERE community_name = 'IWAPI') THEN
        INSERT INTO members (community_name, name, email, phone, domicile, occupation, interest, reason, status, relationship_type, category, profile, is_highlighted)
        VALUES ('IWAPI', '-', '-', '-', 'Indonesia', '-', '-', '-', 'approved', 'strategic_partner', 'Women''s Entrepreneurship', 'Organization representing and supporting women entrepreneurs in Indonesia.', false);
    END IF;

    -- 13. PUSPA Bandung
    IF NOT EXISTS (SELECT 1 FROM members WHERE community_name = 'PUSPA Bandung') THEN
        INSERT INTO members (community_name, name, email, phone, domicile, occupation, interest, reason, status, relationship_type, category, profile, instagram_url, is_highlighted)
        VALUES ('PUSPA Bandung', '-', '-', '-', 'Bandung, Jawa Barat', '-', '-', '-', 'approved', 'strategic_partner', 'Women''s Empowerment', 'Women''s empowerment/community organization in Bandung.', 'https://www.instagram.com/puspa.bdg/', false);
    END IF;

    -- 14. Yayasan Solusi Bersinar Indonesia (YSBI)
    IF NOT EXISTS (SELECT 1 FROM members WHERE community_name = 'Yayasan Solusi Bersinar Indonesia (YSBI)') THEN
        INSERT INTO members (community_name, name, email, phone, domicile, occupation, interest, reason, status, relationship_type, category, profile, instagram_url, is_highlighted)
        VALUES ('Yayasan Solusi Bersinar Indonesia (YSBI)', 'Fifie Raharja', '-', '-', 'Bandung, Jawa Barat', '-', '-', '-', 'approved', 'collaboration_partner', 'Environment & Community Empowerment', 'Organization led by Fifie Raharja focusing on environmental sustainability, waste management, education, and community empowerment.', 'https://www.instagram.com/ysbi_official/', false);
    END IF;

    -- 15. Naisar Forest Garden
    IF NOT EXISTS (SELECT 1 FROM members WHERE community_name = 'Naisar Forest Garden') THEN
        INSERT INTO members (community_name, name, email, phone, domicile, occupation, interest, reason, status, relationship_type, category, profile, instagram_url, is_highlighted)
        VALUES ('Naisar Forest Garden', '-', '-', '-', 'Indonesia', '-', '-', '-', 'approved', 'collaboration_partner', 'Environment / Food / Sustainability', 'Forest-garden/community sustainability initiative associated with environmental and food sustainability activities within Indscript''s 2026 ecosystem activities.', 'https://www.instagram.com/naisarforestgarden/', false);
    END IF;
END $do;