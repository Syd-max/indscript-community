-- Add linkedin_url column
ALTER TABLE members ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Update IIDN
UPDATE members 
SET website_url = 'https://ibuibudoyannulis.com/',
    instagram_url = 'https://www.instagram.com/ibuibudoyannulis/',
    facebook_url = 'https://www.facebook.com/groups/IbuIbuDoyanNulis/'
WHERE community_name = 'IIDN — Ibu-Ibu Doyan Nulis';

-- Update IIDB
UPDATE members 
SET website_url = 'https://indscriptcreative.com/iidb/',
    instagram_url = 'https://www.instagram.com/ibuibu_doyanbisnis/',
    facebook_url = 'https://www.facebook.com/groups/ibudoyanbisnis/'
WHERE community_name = 'IIDB — Ibu-Ibu Doyan Bisnis';

-- Update NJD
UPDATE members 
SET instagram_url = 'https://www.instagram.com/nulisjadiduit/'
WHERE community_name = 'Nulis Jadi Duit (NJD)';

-- Update BSB
UPDATE members 
SET website_url = 'https://www.banksampahbersinar.com/',
    instagram_url = 'https://www.instagram.com/banksampahbersinar.id/'
WHERE community_name = 'BSB — Bank Sampah Bersinar';

-- Update Sekolah Perempuan
UPDATE members 
SET instagram_url = 'https://www.instagram.com/sekolahperempuan.id/'
WHERE community_name = 'Sekolah Perempuan';

-- Update PUSPA Bandung
UPDATE members 
SET instagram_url = 'https://www.instagram.com/puspa.bdg/'
WHERE community_name = 'PUSPA Bandung';

-- Update YSBI
UPDATE members 
SET instagram_url = 'https://www.instagram.com/ysbi_official/'
WHERE community_name = 'Yayasan Solusi Bersinar Indonesia (YSBI)';

-- Update Naisar Forest Garden
UPDATE members 
SET instagram_url = 'https://www.instagram.com/naisarforestgarden/'
WHERE community_name = 'Naisar Forest Garden';

-- Insert or Update TactLink
DO 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM members WHERE community_name = 'TactLink') THEN
        INSERT INTO members (community_name, name, email, phone, domicile, occupation, interest, reason, status, relationship_type, category, profile, logo_url, website_url, instagram_url, linkedin_url, is_highlighted)
        VALUES ('TactLink', 'Danny Ong — CEO & Founder', '-', '-', 'Singapore / Indonesia', '-', '-', '-', 'approved', 'collaboration_partner', 'Technology & Digital Networking', 'Digital networking and smart directory platform for communities, associations, organizations, and events.', '/assets/logo-tactlink.jpg', 'https://www.tactlink.com/', 'https://www.instagram.com/tactlinksmartdirectory/', 'https://www.linkedin.com/company/tactlink/', false);
    ELSE
        UPDATE members SET 
            name = 'Danny Ong — CEO & Founder',
            domicile = 'Singapore / Indonesia',
            relationship_type = 'collaboration_partner',
            category = 'Technology & Digital Networking',
            profile = 'Digital networking and smart directory platform for communities, associations, organizations, and events.',
            logo_url = '/assets/logo-tactlink.jpg',
            website_url = 'https://www.tactlink.com/',
            instagram_url = 'https://www.instagram.com/tactlinksmartdirectory/',
            linkedin_url = 'https://www.linkedin.com/company/tactlink/'
        WHERE community_name = 'TactLink';
    END IF;
END ;