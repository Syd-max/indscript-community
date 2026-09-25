## 1. Sistem Warna (Color System)

Merah Utama (Primary Red)
* Hex: #C1272D
* RGB: 193, 39, 45
* Penggunaan UI: Tombol aksi utama (CTA) seperti "Daftar Event" atau "Gabung Membership", warna teks sorotan, tautan aktif, dan ikon utama. Warna ini mewakili teks "indscript" dan "COMMUNITY" yang tegas.

Kuning Aksen (Accent Gold)
* Hex: #F5B92F
* RGB: 245, 185, 47
* Penggunaan UI: Elemen aksen dalam jumlah kecil (maksimal 10% dari tampilan layar), lencana status (badge), notifikasi, atau ikon interaktif. Warna ini diambil dari detail kayu pada ikon pensil.

Abu-abu Netral (Neutral Grey)
* Hex: #7A7A7A
* RGB: 122, 122, 122
* Penggunaan UI: Teks pendukung, deskripsi formulir, tanggal event, ikon non-aktif, atau garis pemisah (*divider*). Warna ini merepresentasikan elemen badan roket dan tagline.

Abu-abu Gelap (Teks Utama)
* Hex: #333333
* Penggunaan UI: Warna utama untuk seluruh teks paragraf, artikel, dan konten. Hindari warna hitam pekat (#000000) agar mata pengguna tidak cepat lelah saat membaca layar.

Abu-abu Terang (Background & Surface)
* Hex: #F8F9FA
* Penggunaan UI: Latar belakang untuk kartu event (card), kolom input formulir registrasi, atau area pemisah seksi web agar tata letak tidak monoton putih polos.


## 2. Tipografi

* Judul & Heading (H1, H2, H3): Montserrat (Bold / 700 & ExtraBold / 800)
* Karakternya geometris, lebar, dan modern. Font ini selaras dengan struktur huruf kapital pada teks "COMMUNITY". Sangat cocok untuk judul banner dan nama event.

* Teks Bodi & Konten Utama: Open Sans atau Inter (Regular / 400 & Medium / 500)
* Font sans-serif ini memiliki tingkat keterbacaan optimal di berbagai ukuran layar digital, memastikan informasi pada halaman registrasi dan persyaratan kolaborasi mudah dipahami.

* Teks Aksen & Kutipan: Caveat atau Dancing Script (Regular)
* Gunakan secara spesifik untuk mereplikasi nuansa tagline tulisan tangan "Sahabatmu Mewujudkan Mimpi!". Cocok untuk elemen kutipan (*quotes*) testimoni anggota komunitas.


## 3. Implementasi Komponen UI

* Tombol Utama (Primary CTA):
* Latar Belakang: #C1272D
* Warna Teks: #FFFFFF
* Bentuk: Sudut membulat sedang (border-radius: 6px atau 8px) untuk memberikan kesan profesional namun tetap ramah.
* Efek Hover: Berubah menjadi merah yang lebih gelap (#A01F25) saat kursor diarahkan.


* Tombol Sekunder (Secondary Action):
* Latar Belakang: Transparan
* Garis Tepi (Border): 1.5px solid #C1272D
* Warna Teks: #C1272D


* Bidang Formulir (Input Fields):
* Latar Belakang: #FFFFFF atau #F8F9FA
* Garis Tepi: #E0E0E0 (Berubah menjadi #C1272D saat kolom sedang diketik/fokus).
* Teks Label: #333333 (Medium).