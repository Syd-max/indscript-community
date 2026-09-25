# PRODUCT REQUIREMENT DOCUMENT (PRD) INDSCRIPT

## INDSCRIPT COMMUNITY WEBSITE

Versi: 1.0
Platform: Web Responsive
Deployment: Vercel
Status: Development Planning

## 1. Product Overview

### 1.1 Nama Produk

**INDSCRIPT COMMUNITY**

### 1.2 Deskripsi

INDSCRIPT COMMUNITY adalah website komunitas yang menjadi pusat informasi mengenai kegiatan, event, membership, kolaborasi, dan sponsorship dari Indscript Community.

Website dirancang untuk memudahkan pengunjung untuk:

* Mengenal INDSCRIPT COMMUNITY
* Melihat kegiatan dan event yang akan datang
* Melakukan registrasi event
* Bergabung sebagai member
* Mengajukan kolaborasi
* Mengajukan sponsorship
* Melihat aktivitas terbaru melalui Instagram dan YouTube

Visual website menggunakan brand identity INDSCRIPT CREATIVE sebagai referensi utama, tetapi pengalaman pengguna dibuat lebih fokus pada komunitas, aktivitas, dan event.

### 1.3 Referensi Utama

Website Indscript Creative digunakan sebagai referensi brand identity, visual direction, dan content ecosystem.

[Indscript Creative](https://indscriptcreative.com/?utm_source=chatgpt.com)

Social media yang menjadi sumber aktivitas Community:

[Instagram — @tehindari](https://www.instagram.com/tehindari)
[YouTube — Indscript Creative](https://www.youtube.com/@IndscriptCreative)


## 2. Product Goals

Website memiliki tujuan utama:

1. Menjadi digital hub resmi INDSCRIPT COMMUNITY.
2. Meningkatkan awareness terhadap kegiatan Community.
3. Memudahkan masyarakat menemukan dan mendaftar event.
4. Membuka akses membership yang lebih mudah.
5. Menyediakan jalur resmi untuk sponsorship dan collaboration.
6. Menampilkan aktivitas Community melalui integrasi media sosial.
7. Membangun kesan Community yang aktif, terbuka, dan profesional.

### Success Indicators

Keberhasilan MVP dapat dilihat dari:

* Pengunjung dapat memahami Community dalam beberapa detik pertama.
* Event yang tersedia mudah ditemukan.
* Pengunjung dapat melakukan registrasi tanpa kebingungan.
* Tersedia jalur jelas untuk Membership, Collaboration, dan Sponsorship.
* Konten Instagram/YouTube dapat diakses dari website.
* Website nyaman digunakan melalui mobile maupun desktop.

## 3. Target Users

### Primary User

**Calon Member**

* Ingin mengetahui tentang Community.
* Ingin mengikuti event.
* Ingin bergabung menjadi member.

**Event Participant**

* Mencari informasi event.
* Membutuhkan detail acara.
* Ingin melakukan registrasi.

### Secondary User

**Potential Collaborator**

* Komunitas, organisasi, institusi, brand, maupun individu yang ingin bekerja sama.

**Potential Sponsor**

* Brand atau perusahaan yang ingin mendukung kegiatan Community.

**Existing Member**

* Mengikuti kegiatan terbaru dan menemukan event berikutnya.


## 4. Information Architecture

Struktur utama website:

INDSCRIPT COMMUNITY
│
├── Home
│
├── About Community
│
├── Events
│   ├── Upcoming Events
│   └── Event Detail
│
├── Membership
│
├── Collaboration
│
├── Sponsorship
│
└── Social Media
    ├── Instagram
    └── YouTube

Untuk MVP, struktur tersebut dapat dibuat sebagai single-page website dengan section, sementara detail event dapat dibuat sebagai halaman/route tersendiri jika diperlukan.

## 5. Homepage Requirements

## 5.1 Navbar

Navbar harus menyediakan navigasi menuju section utama.

**Content:**

* Logo INDSCRIPT COMMUNITY
* Home
* About
* Events
* Membership
* Collaboration
* Sponsorship
* CTA utama

CTA dapat berupa:

**Join Community**

### Requirement

* Sticky saat scrolling.
* Responsive.
* Mobile menggunakan hamburger menu.
* Logo dapat diklik untuk kembali ke Home.


## 6. Hero Section

Hero menjadi bagian pertama yang dilihat pengguna.

### Tujuan

Menyampaikan secara cepat:

> Apa itu INDSCRIPT COMMUNITY dan mengapa pengunjung perlu mengenalnya.

### Content

* Headline
* Short description
* Primary CTA
* Secondary CTA
* Key visual/photography

Contoh struktur:

INDSCRIPT COMMUNITY

[Headline]

Ruang untuk berkarya,
bertumbuh, dan berkolaborasi.

[ Gabung Community ] [ Lihat Event ]

**Catatan:** Copy final dapat disesuaikan dengan arahan tim Community.

### Acceptance Criteria

* Hero terlihat jelas tanpa harus melakukan banyak scrolling.
* CTA dapat langsung menuju Membership/Event.
* Visual mengikuti color guideline yang telah tersedia.
* Responsive pada mobile.


## 7. About Community

Section untuk menjelaskan identitas Community.

### Content

* Apa itu INDSCRIPT COMMUNITY?
* Fokus Community
* Nilai/semangat Community
* Siapa yang dapat bergabung
* Foto aktivitas jika tersedia

### Tujuan

Pengunjung yang baru mengenal Indscript dapat memahami Community tanpa harus mencari informasi dari sumber lain.


## 8. Upcoming Events

Ini menjadi salah satu **core feature** website.

### Event Card

Setiap event minimal memiliki:

* Event image/poster
* Event name
* Date
* Time
* Location / Online
* Short description
* Registration status
* CTA **Daftar Event**

Contoh:

[ EVENT IMAGE ]

WORKSHOP MENULIS
20 OCTOBER 2026
10.00 WIB
Jakarta

[ LIHAT DETAIL ]


### Event Status

Event dapat memiliki status:

* OPEN REGISTRATION
* COMING SOON
* FULL
* CLOSED
* COMPLETED

### Acceptance Criteria

* Pengunjung dapat membedakan event yang masih terbuka dan sudah selesai.
* Event terbaru dapat ditempatkan paling atas.
* CTA registrasi hanya aktif jika pendaftaran tersedia.


## 9. Event Detail

Jika event memiliki halaman detail, informasi minimal:

### Event Information

* Cover
* Nama event
* Date
* Time
* Location
* Description
* Speaker/Guest jika ada
* Organizer
* Registration deadline
* Participant information
* Registration CTA

### Registration

CTA:

**REGISTER NOW**

akan mengarahkan ke formulir registrasi.


## 10. Live/event attendance indicator

Live/event attendance indicator yang menunjukkan aktivitas atau jumlah peserta yang telah hadir/terdaftar.

Contoh:

COMMUNITY IS MOVING

120+
People Joined

45
Already Checked In

20+
Communities Connected

### MVP

Jika data realtime belum tersedia, gunakan:

* jumlah registrasi, atau
* jumlah peserta yang sudah hadir berdasarkan data event.

**Jangan menampilkan angka yang tidak memiliki sumber data.**

Jika ke depannya tersedia sistem check-in, section ini dapat dikembangkan menjadi data realtime.


## 11. Membership

## Open Membership

Section untuk mengajak pengunjung bergabung.

### Content

* Benefit membership
* Siapa yang dapat bergabung
* CTA Join
* Registration form

### Form Minimum

* Nama lengkap
* Email
* Nomor WhatsApp
* Domisili
* Pekerjaan/status
* Interest/minat
* Alasan bergabung

Field final dapat disesuaikan dengan kebutuhan Community.

### Flow

Landing Page
     ↓
Membership
     ↓
Join Community
     ↓
Registration Form
     ↓
Submit
     ↓
Success Confirmation


### Success State

Setelah submit:

> "Registrasi berhasil. Informasi selanjutnya akan dikirim melalui kontak yang telah didaftarkan."


## 12. Open Collaboration

Section khusus untuk pihak yang ingin melakukan kerja sama.

### Target

* Community
* Institution
* School
* University
* Brand
* Organization
* Individual/Professional

### Content

* Collaboration description
* Potential collaboration types
* CTA **Let's Collaborate**

### Form

Minimum:

* Nama
* Organization/Company
* Email
* WhatsApp
* Collaboration type
* Proposal/description
* Link portfolio/proposal jika ada

### Flow

Collaboration
      ↓
Submit Proposal
      ↓
Success
      ↓
Team Review
      ↓
Contact / Follow-up


## 13. Open Sponsorship

Section untuk membuka kesempatan sponsorship.

### Content

* Sponsorship opportunity
* Event/program yang membutuhkan sponsor
* Potential exposure/benefit
* CTA **Become a Sponsor**

### Form

Minimum:

* Nama PIC
* Company/Brand
* Email
* WhatsApp
* Sponsorship interest
* Budget/range jika memang diperlukan
* Message
* Attachment/proposal jika diperlukan

### Acceptance Criteria

* Sponsor memahami konteks kerja sama sebelum mengisi form.
* Form dapat dikirim dengan baik.
* Setelah submit terdapat confirmation state.

# 14. Social Media Integration

Social media merupakan bagian penting karena aktivitas Community banyak dibagikan melalui Instagram dan YouTube.

## Instagram

Sumber:

**@tehindari**

Website dapat menampilkan:

* Latest content
* Activity/documentation
* CTA menuju Instagram

Jika metode embed/feed memiliki keterbatasan teknis, gunakan **preview content + link ke Instagram** sebagai fallback.

## YouTube

Sumber:

**Indscript Creative**

Dapat menggunakan YouTube embed untuk:

* Video terbaru
* Video kegiatan
* Dokumentasi event

Contoh:

LATEST FROM US

[ YouTube Video ]
[ YouTube Video ]
[ YouTube Video ]

Follow our journey

### Acceptance Criteria

* Video dapat diputar tanpa meninggalkan website jika menggunakan embed.
* Link Instagram dapat membuka akun/content terkait.
* Embed tidak merusak layout mobile.


## 15. Footer

Footer minimal berisi:

* Logo INDSCRIPT COMMUNITY
* Short description
* Navigation
* Instagram
* YouTube
* Contact
* Copyright

Contoh:

INDSCRIPT COMMUNITY

Connect. Create. Collaborate.

Home
About
Events
Membership
Collaboration
Sponsorship

Instagram | YouTube

© 2026 Muhammad Irsyad Andika


## 16. Functional Requirements

| ID    | Requirement                                    | Priority |
| ----- | ---------------------------------------------- | -------- |
| FR-01 | User dapat melihat informasi Community         | Must     |
| FR-02 | User dapat melihat upcoming event              | Must     |
| FR-03 | User dapat melihat detail event                | Must     |
| FR-04 | User dapat melakukan registrasi event          | Must     |
| FR-05 | User dapat mendaftar membership                | Must     |
| FR-06 | User dapat mengajukan collaboration            | Must     |
| FR-07 | User dapat mengajukan sponsorship              | Must     |
| FR-08 | User dapat melihat aktivitas social media      | Must     |
| FR-09 | YouTube dapat di-embed                         | Should   |
| FR-10 | Instagram content dapat ditampilkan/di-link    | Should   |
| FR-11 | Attendance/participant count dapat ditampilkan | Should   |
| FR-12 | Website responsive                             | Must     |
| FR-13 | Website dapat di-deploy melalui Vercel         | Must     |


## 17. Non-Functional Requirements

### Responsive

Website wajib berjalan baik pada:

* Mobile
* Tablet
* Desktop

### Performance

* Optimasi ukuran gambar.
* Lazy loading untuk media yang diperlukan.
* Hindari script/animation yang tidak memberikan fungsi.
* Embed social media tidak boleh menyebabkan halaman utama terlalu berat.

### Accessibility

* Kontras teks dan background mengikuti guideline yang tersedia.
* Button memiliki label jelas.
* Form memiliki label.
* Gambar memiliki alt text.

### Browser

Minimal mendukung browser modern:

* Chrome
* Edge
* Firefox
* Safari


## 18. Visual & UI Direction

### Primary Reference

Website:

**Indscript Creative**

Namun website Community **tidak dibuat sebagai clone**.

### Visual Principle

INDscript Brand
       +
Community Energy
       +
Event-driven UX
       +
Modern Web Experience


### Existing Assets

Sudah tersedia:

* Logo
* Color guideline
* Instagram
* YouTube

### Yang masih fleksibel

* Typography
* Photography
* Iconography
* Section composition
* CTA wording
* Event card design
* Animation/microinteraction

Semua tetap harus konsisten dengan brand guideline yang diberikan.


## 19. User Flow

## Event Registration

Home
 ↓
Upcoming Event
 ↓
Event Detail
 ↓
Register
 ↓
Registration Form
 ↓
Submit
 ↓
Confirmation


## Membership

Home
 ↓
Membership
 ↓
Join
 ↓
Form
 ↓
Submit
 ↓
Confirmation


## Collaboration

Home
 ↓
Collaboration
 ↓
Submit Proposal
 ↓
Form
 ↓
Confirmation


## Sponsorship

Home
 ↓
Sponsorship
 ↓
Become Sponsor
 ↓
Form
 ↓
Confirmation


## 20. Data Requirements

Untuk MVP, minimal terdapat data:

### Event

event_id
title
description
image
date
time
location
status
registration_link
participant_count

### Membership

name
email
phone
domicile
occupation
interest
reason


### Collaboration

name
organization
email
phone
collaboration_type
description
portfolio/proposal


### Sponsorship

pic_name
company
email
phone
sponsorship_type
message
proposal


## 21. Technical Direction

### Frontend

Bisa menggunakan:

* HTML/CSS/JavaScript, atau
* React/Next.js jika memang dibutuhkan.

Karena deployment menggunakan Vercel, **Next.js merupakan opsi yang cocok**, tetapi framework tidak perlu dibuat kompleks jika kebutuhan MVP masih sederhana.

### Deployment

GitHub
   ↓
Vercel
   ↓
INDSCRIPT COMMUNITY WEBSITE

### Form Backend

Untuk tahap awal dapat menggunakan supabase.
 
## 22. MVP Scope

### Must Have

* [x] Homepage
* [x] Brand identity
* [x] About Community
* [x] Upcoming Events
* [x] Event registration
* [x] Membership
* [x] Collaboration
* [x] Sponsorship
* [x] Instagram link/integration
* [x] YouTube integration
* [x] Responsive design
* [x] Vercel deployment

### Should Have

* [ ] Event detail page
* [ ] Participant count
* [ ] YouTube embed
* [ ] Instagram content preview
* [ ] Microinteraction
* [ ] Registration success state

### Future Development

* Admin dashboard
* Event management
* Member database
* Real-time attendance/check-in
* Membership verification
* Event analytics
* Automated email/WhatsApp notification
* Member profile


# 23. Acceptance Criteria

Project dianggap memenuhi requirement MVP apabila:

1. Website dapat diakses melalui URL Vercel.
2. Tampilan desktop dan mobile responsive.
3. Identitas visual sesuai guideline Indscript yang diberikan.
4. Pengunjung dapat memahami fungsi Community dari homepage.
5. Upcoming event dapat ditampilkan.
6. Pengunjung dapat melakukan registrasi event.
7. Pengunjung dapat mengajukan membership.
8. Pengunjung dapat mengajukan collaboration.
9. Pengunjung dapat mengajukan sponsorship.
10. Instagram dan YouTube dapat diakses dari website.
11. YouTube embed berjalan apabila digunakan.
12. Tidak terdapat broken link, button, atau form.
13. Setelah submit form, user mendapatkan feedback bahwa data berhasil dikirim.
14. Tidak ada data dummy yang ditampilkan sebagai data nyata pada production.


# 24. Deliverables

Output akhir Project 1:

1. UI/UX Design
2. Responsive Website
3. Event Registration
4. Membership Form
5. Collaboration Form
6. Sponsorship Form
7. Social Media Integration
8. GitHub Repository
9. Vercel Deployment
10. Documentation
