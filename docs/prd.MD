
### Dokumen 1: `PRD.md` (Product Requirements Document)
# Product Requirements Document (PRD): Portal Pintar & Barcode Informasi Serbaguna Alun-Alun Cianjur

## 1. Problem Statements
1. **Kesulitan Menemukan Titik Tempat Sampah (Tantangan Budaya K5):** Pemerintah Daerah Kabupaten Cianjur melalui Dinas Lingkungan Hidup (DLH) dan Satpol PP aktif mengampanyekan **Budaya K5 (Kebersihan, Keindahan, Keamanan, Ketertiban, dan Kenyamanan)** di Taman Alun-Alun Cianjur yang luasnya lebih dari 4 hektar. Meskipun fasilitas tempat sampah telah disediakan di berbagai titik strategis, ketiadaan peta mikro penunjuk titik tong sampah di layar ponsel membuat pengunjung kerap membuang sampah sembarangan di area duduk dan rumput sintetis, sehingga petugas DLH harus bekerja ekstra mengangkut sampah setiap hari termasuk di hari libur.
2. **Minimnya Akses Informasi Sejarah Ikon & Tiga Pilar Budaya:** Banyak pengunjung yang berswafoto di Monumen Al-Qur'an, Lorong 99 Tiang Asmaul Husna, Panggung Suling, maupun Koloseum tanpa mengetahui filosofi **Tiga Pilar Budaya Cianjur (*Ngaos, Mamaos, Maenpo*)** di balik ornamen tersebut, ataupun sejarah bahwa sisi timur alun-alun berdiri di atas lahan eks Pasar Induk Cianjur (PIC) yang terbakar pada 27 Agustus 2013 dan diresmikan Presiden Joko Widodo pada 8 Februari 2019[cite: 2]. Selain itu, situs cagar budaya penting yang hanya berjarak beberapa langkah dari alun-alun—seperti Masjid Agung (1810), Pendopo Kabupaten (~1780), Lonceng Batavia (1774), Kantor Pos Hindia Belanda, hingga Bumi Ageung Cikidang (1886)—belum terhubung dalam satu panduan digital terpadu.
3. **Fragmentasi Informasi Kuliner & Akomodasi Sekitar Alun-Alun:** Wisatawan luar daerah kesulitan menemukan kuliner otentik khas "Kota Tauco" dan penghasil beras Pandanwangi yang berada dalam radius jalan kaki atau berkendara singkat dari Alun-Alun (seperti Bubur Ayam Sampurna di Bojongmeron, Geco Pak Iding di Jl. Siti Jenab, Sate Maranggi Ma' Nunung, Roti Tan Keng Cu 1926, hingga Tauco Cap Meong 1880), termasuk ketidaktahuan akan jam operasional spesifik (seperti Roti Tan Keng Cu yang tutup setiap hari Senin) serta pilihan hotel terdekat dari jarak 172 meter hingga 3,27 km.
4. **Hambatan Aksesibilitas Aplikasi di Ruang Publik:** Pengunjung yang memindai QR Code di ruang terbuka publik enggan mengunduh aplikasi berukuran besar dari Play Store/App Store atau melakukan registrasi/login akun yang rumit, serta sering mengalami penurunan kualitas jaringan seluler saat area Alun-Alun dipadati ribuan warga pada akhir pekan atau hari besar.
5. **Dinamika Kebijakan Buka-Tutup Kawasan:** Alun-Alun Cianjur memiliki riwayat kebijakan buka-tutup berkala yang dijaga oleh Satpol PP untuk pemeliharaan fasilitas dan penertiban kawasan, sehingga pengunjung membutuhkan informasi status kawasan secara langsung beserta pengalihan rute wisata ke jalur perimeter luar ketika area dalam ditutup sementara.

---

## 2. Goals
1. **Instant Scan-and-Go Experience:** Menyediakan *Progressive Web Application* (PWA) berbasis *Single Page Application* (SPA) yang dapat langsung diakses melalui pemindaian QR Code di 3 gerbang utama Alun-Alun Cianjur dengan waktu muat awal (*First Contentful Paint*) **< 1,2 detik** dan beban unduhan awal **< 100 KB** menggunakan mesin peta ringan Leaflet.js (~42 KB *gzipped*)[cite: 1].
2. **Digitalisasi Pemetaan Mikro Tong Sampah & Destinasi:** Memudahkan pengunjung menemukan titik tong sampah terdekat menggunakan kalkulasi jarak GPS (*Haversine Formula*) di 6 zona klaster Alun-Alun, sekaligus memetakan 16 ikon sejarah, 10 sentra kuliner legendaris, dan 12 akomodasi hotel dalam satu peta interaktif tanpa biaya kuota API bulanan[cite: 1].
3. **Edukasi Interaktif & Gamifikasi Tanpa Login (Zero-Auth Gamification):** Meningkatkan literasi pengunjung terhadap sejarah lokal dan kepatuhan Budaya K5 melalui 5 misi interaktif (*scavenger hunt* & *eco-pledge*) serta fitur pemandu suara otomatis (*Web Speech API*) yang berhadiah lencana/sertifikat digital siap unduh.
4. **Zero Operational & Server Cost:** Memastikan aplikasi berjalan 100% tanpa biaya database atau tagihan API peta bulanan sehingga dapat dioperasikan secara berkelanjutan oleh pengelola/siswa[cite: 1].

---

## 3. Target User
1. **Wisatawan Luar Kota & Penumpang Kereta Api:** Pengunjung yang tiba di pusat Kota Cianjur (termasuk pengguna KA Siliwangi via Stasiun Cianjur yang berjarak 502–600 meter dari kawasan pusat/hotel terdekat) yang membutuhkan panduan peta destinasi, kuliner legendaris yang sedang buka, serta rekomendasi penginapan sesuai anggaran.
2. **Warga Lokal, Pelajar & Keluarga Pengunjung Alun-Alun:** Masyarakat yang berekreasi di area rumput sintetis, taman bermain anak, Lorong Asmaul Husna, atau selasar Masjid Agung yang membutuhkan petunjuk fasilitas umum (khususnya titik tong sampah terdekat) serta hiburan edukatif berupa misi interaktif di ponsel mereka.
3. **Tim Pengelola / Survei Lapangan (Admin Siswa):** Pengguna internal (Sultan dan tim) yang menggunakan fitur tersembunyi `/admin-mapper` di ponsel mereka untuk memetakan dan memperbarui titik koordinat GPS riil tong sampah di lapangan tanpa perlu menguasai pemrograman.

---

## 4. User Storage (Client-Side Storage & Data Persistence Architecture)
Sistem ini menerapkan arsitektur **Zero-Backend Database**. Seluruh penyimpanan data dibagi menjadi 3 mekanisme penyimpanan di sisi perangkat pengguna (*Client-Side Storage*):

### 4.1. Static Application Data (`src/data/cianjur-data.json`)
File JSON statis berukuran ~35 KB yang di-*bundle* bersama aplikasi (0 ms *database latency*) sebagai *Single Source of Truth*, memuat 6 koleksi objek utama:
- `app_config`: Menyimpan `center_coords: [-6.821111, 107.140000]`, `default_zoom: 18`, `park_status: "OPEN" | "PERIMETER_ONLY"`, dan `status_message`.
- `gates[]`: Koordinat 3 gerbang masuk utama (`suroso`, `masjid-selatan`, `masjid-utara`).
- `trash_bins[]`: Array GeoJSON titik tempat sampah di 6 zona klaster (`id`, `cluster_name`, `coords`, `bin_type`, `landmark_hint`).
- `heritage_icons[]`: Array 16 situs sejarah (`id`, `name`, `zone: "INTERNAL" | "EXTERNAL"`, `pilar_tag`, `year_built`, `address`, `distance_m`, `coords`, `summary`, `quiz_id`).
- `culinary_spots[]`: Array 10 kuliner khas (`id`, `name`, `category`, `address`, `distance_m`, `coords`, `price_range`, `min_price`, `open_days[]`, `open_time`, `close_time`, `signature_menu[]`, `history_note`).
- `hotels[]`: Array 12 hotel sekitar alun-alun (`id`, `name`, `address`, `distance_m`, `coords`, `rating`, `review_count`, `price_start_idr`, `facilities[]`, `maps_query`).
- `missions[]`: Array 5 misi interaktif (`id`, `title`, `pilar`, `xp_reward`, `badge_name`, `verification_type: "QUIZ" | "GPS_TRASH_CHECKIN"`, `question`, `answer_key[]`, `target_coords`).

### 4.2. Browser `window.localStorage` (Key: `cianjur_quest_v1`)
Digunakan untuk menyimpan state progres misi, skor XP, dan preferensi pengunjung secara persisten di peramban HP tanpa perlu login akun. Skema objek JSON di dalam `localStorage`:
```json
{
  "visitor_nickname": "Pengunjung Santun",
  "entry_gate": "suroso",
  "total_xp": 350,
  "completed_missions": ["MSN-01", "MSN-03"],
  "trash_checkins_count": 1,
  "last_trash_bin_id": "BIN-ASH-01",
  "unlocked_badges": ["Penjaga Pilar Ngaos", "Pahlawan Kebersihan K5"],
  "certificate_claimed": false,
  "last_active_timestamp": 1794407220000
}

```

*Catatan Penyimpanan Admin:* Untuk halaman utilitas `/admin-mapper`, titik koordinat tong sampah yang sedang disurvei disimpan sementara pada key `localStorage` terpisah bernama `cianjur_admin_draft_bins` agar tidak hilang jika peramban tidak sengaja tertutup saat berjalan kaki di Alun-Alun.

### 4.3. PWA Cache Storage (`Service Worker / Workbox`)

* **Pre-cache Assets:** Menyimpan `index.html`, bundle JS/CSS, ikon SVG kustom, dan `cianjur-data.json` pada saat pemindaian QR pertama kali.
* **Runtime Map Tile Cache:** Menyimpan *tile* peta OpenStreetMap/CartoDB yang telah dilihat pengguna di dalam *Cache Storage* (`map-tiles-cache`, maksimal 150 *tiles*, masa berlaku 30 hari) sehingga peta Alun-Alun tetap dapat digeser (*pan/zoom*) meskipun koneksi internet pengguna terputus.

---

## 5. Functional Requirements

### FR-01: Smart QR Gate Entry & Status Kawasan (`<AppHeader />` & URL Parser)

* **FR-01.1:** Sistem harus membaca parameter URL `?gate=` saat halaman pertama kali dimuat:
* `?gate=suroso` -> Memusatkan peta pada Gerbang Jalan Suroso (`[-6.821100, 107.140650]`, zoom 19) dan memunculkan pesan sambutan kontekstual.
* `?gate=masjid-selatan` -> Memusatkan peta pada Gerbang Selatan Masjid Agung (`[-6.821550, 107.139950]`, zoom 19).
* `?gate=masjid-utara` -> Memusatkan peta pada Gerbang Utara Masjid Agung (`[-6.820650, 107.139900]`, zoom 19).
* Tanpa parameter -> Memusatkan peta pada titik tengah Alun-Alun (`[-6.821111, 107.140000]`, zoom 18).


* **FR-01.2:** Menampilkan *Banner Status Kawasan* di bagian atas layar berdasarkan atribut `park_status` (`OPEN` = Hijau / Buka Normal; `PERIMETER_ONLY` = Kuning / Area Rumput Dalam Ditutup Sementara oleh Satpol PP, mengarahkan pengunjung ke rute trotoar luar Jl. Siti Jenab dan cagar budaya sekitar).

### FR-02: Peta Interaktif & Pencari Tong Sampah Terdekat (`<MapView />`)

* **FR-02.1:** Merender peta interaktif menggunakan `leaflet` dan `react-leaflet` dengan pembedaan ikon pin SVG berdasarkan 4 kategori: Tong Sampah (Hijau), Ikon Sejarah (Emas/Biru), Kuliner (Oranye), dan Hotel (Ungu).


* **FR-02.2:** Menyediakan tombol filter mengambang (*Floating Filter Pills*): `Semua`, `🗑️ Tong Sampah`, `🕌 Sejarah`, `🍲 Kuliner`, dan `🏨 Hotel`.
* **FR-02.3:** Menyediakan tombol aksi utama **`🎯 Cari Tong Sampah Terdekat`**. Saat ditekan, sistem mengambil koordinat GPS perangkat (`navigator.geolocation.getCurrentPosition`), menghitung jarak ke seluruh titik di `trash_bins[]` menggunakan rumus **Haversine**, menggambar garis putus-putus (*polyline* hijau) dari posisi pengguna ke tong sampah terdekat, membuka *popup* informasi tong sampah tersebut, dan menampilkan jarak dalam meter beserta petunjuk patokan fisik (`landmark_hint`).

### FR-03: Direktori Sejarah Ikon & Pemandu Suara (`<HeritageView />`)

* **FR-03.1:** Menampilkan seluruh 16 ikon sejarah Cianjur dengan filter zona: `Semua (16)`, `Di Dalam Alun-Alun (8)`, dan `Sekitar Kota / Cagar Budaya (8)`.
* **FR-03.2:** Menyediakan filter berdasarkan Tiga Pilar Budaya & Warisan: `Ngaos`, `Mamaos`, `Maenpo`, dan `Heritage`.


* **FR-03.3:** Menyediakan fitur **Audio Narration (Pemandu Suara)** pada setiap kartu/modal sejarah menggunakan Web Speech API bawaan peramban (`window.speechSynthesis`, bahasa `id-ID`) dengan tombol `🔊 Dengarkan Sejarah` dan `⏹️ Hentikan`.
* **FR-03.4:** Menyediakan tombol pintasan `Lihat di Peta` (memindahkan tampilan ke Tab Peta dan menyorot pin lokasi terkait) serta tombol `Jawab Kuis (+XP)` untuk ikon yang terhubung dengan misi permainan.

### FR-04: Direktori Kuliner Khas & Kalkulator Jam Operasional (`<CulinaryView />`)

* **FR-04.1:** Menampilkan 10 rekomendasi kuliner khas Cianjur lengkap dengan jarak dari Alun-Alun, alamat, kisaran harga, daftar menu andalan (`signature_menu`), dan catatan sejarah singkat.
* **FR-04.2:** Menghitung status operasional secara *real-time* berdasarkan jam dan hari pada perangkat pengguna (`new Date()`):
* Menampilkan badge hijau **`[BUKA SEKARANG]`** jika waktu saat ini berada di dalam rentang `open_days` dan `open_time`–`close_time`.
* Menampilkan badge merah **`[TUTUP - Buka HH:mm]`** jika di luar jam operasional.
* Menangani kasus khusus secara akurat: **Toko Roti Tan Keng Cu** wajib menampilkan **`[TUTUP HARI SENIN]`** jika diakses pada hari Senin (`day === 1`), dan **Bubur Ayam Lestari** selalu menampilkan **`[BUKA 24 JAM]`**.


* **FR-04.3:** Menyediakan tombol `Rute Google Maps` pada setiap kartu kuliner untuk navigasi jalan kaki atau berkendara.

### FR-05: Direktori Rekomendasi Hotel (`<HotelView />`)

* **FR-05.1:** Menampilkan 12 hotel dan penginapan di sekitar Alun-Alun Cianjur lengkap dengan jarak (meter/km), skor ulasan, estimasi tarif per malam, dan label fasilitas.
* **FR-05.2:** Menyediakan fitur pengurutan (*Sorting*): `Jarak Terdekat` (default, diurutkan mulai dari Alamii Kaoem Guest House 172m) dan `Harga Termurah` (diurutkan mulai dari OYO 94802 Hotel Prima Rp108.000).
* **FR-05.3:** Menyediakan filter fasilitas cepat: `Semua`, `Jalan Kaki (≤ 1 km)`, `Ada Kolam Renang` (Cordela Suites, Gino Feruci, Miracle Hotel), dan `Budget (< Rp250.000)`.

### FR-06: Sistem Misi Interaktif K5 & Generator Sertifikat (`<QuestView />`)

* **FR-06.1:** Menampilkan dasbor progres pemain (Total XP, jumlah misi selesai, dan koleksi lencana) yang disinkronkan langsung dengan `localStorage` (`cianjur_quest_v1`).
* **FR-06.2:** Memvalidasi 4 misi kuis sejarah dan kuliner (`MSN-01`, `MSN-02`, `MSN-04`, `MSN-05`) menggunakan pencocokan teks *case-insensitive* (`toLowerCase().trim()`).
* **FR-06.3:** Memvalidasi misi aksi fisik **`MSN-03 (Ksatria K5: Operasi Bersih Alun-Alun)`** melalui pengecekan jarak GPS pengguna terhadap koordinat `trash_bins[]` (valid jika jarak ≤ 35 meter), disertai mekanisme *fallback* pemilihan nama klaster tong sampah apabila pengguna menolak izin GPS atau sinyal GPS perangkat tidak akurat.
* **FR-06.4:** Membuka fitur **Generator Sertifikat Digital (`<BadgeCanvas />`)** saat pengguna mencapai minimal **350 XP**. Sistem merender gambar vertikal ukuran *Story* (1080x1920 piksel) menggunakan HTML5 `<canvas>` yang mencantumkan nama pengguna, total XP, lencana yang diraih, serta kutipan *Ngaos, Mamaos, Maenpo*, lengkap dengan tombol `Unduh Sertifikat (.PNG)`.

### FR-07: Utilitas Survei Lapangan Tersembunyi (`/admin-mapper`)

* **FR-07.1:** Menyediakan halaman khusus yang hanya aktif saat mengakses URL `?mode=admin` atau `/admin-mapper`.
* **FR-07.2:** Menampilkan koordinat GPS *real-time* beserta tingkat akurasinya dalam satuan meter (`coords.accuracy`), pilihan dropdown 6 klaster Alun-Alun, pilihan jenis tong sampah (`ORGANIK_ANORGANIK` / `UMUM`), dan kolom teks patokan lokasi (`landmark_hint`).
* **FR-07.3:** Menyediakan tombol `Simpan Titik ke Draft` dan `Salin JSON (Copy to Clipboard)` yang menghasilkan format array JSON sesuai skema `trash_bins[]` di `cianjur-data.json`.

---

## 6. Non-Functional Requirements

1. **Performance & Bundle Size:**
* Ukuran pustaka pemetaan wajib menggunakan **Leaflet.js (~42 KB *gzipped*)**, bukan Mapbox GL JS (~500 KB) atau Google Maps API (~200 KB).


* Total waktu muat halaman awal (*First Contentful Paint*) pada koneksi 4G seluler harus **< 1,2 detik**.
* Perpindahan antar-tab pada *Bottom Navigation Bar* harus berlangsung instan (**< 50 milidetik**) karena menggunakan arsitektur SPA dan JSON lokal tanpa pemanggilan *network API* tambahan.


2. **Mobile-First Ergonomics & Responsiveness:**
* Antarmuka dirancang khusus untuk layar vertikal ponsel pintar (lebar 360px hingga 430px) dan dibungkus dalam kontainer terpusat (`max-w-md mx-auto`) jika dibuka di layar desktop.
* Seluruh tombol interaktif, *filter pills*, dan tab navigasi bawah harus memiliki area sentuh (*touch target*) minimal **44x44 piksel** agar nyaman dioperasikan dengan satu ibu jari sambil berjalan kaki.


3. **Offline Resilience & PWA Compliance:**
* Aplikasi wajib memiliki `manifest.json` dan *Service Worker* aktif sehingga tetap dapat dibuka dan menampilkan direktori sejarah, kuliner, hotel, serta progres kuis meskipun koneksi internet pengunjung tiba-tiba terputus di tengah Alun-Alun.


4. **Zero External API Billing & Privacy:**
* Dilarang menggunakan layanan peta atau pihak ketiga yang membutuhkan kartu kredit atau memiliki batas kuota berbayar bulanan.


* Koordinat GPS pengguna hanya diproses di dalam memori peramban (*in-memory client calculation*) untuk menghitung jarak ke tong sampah terdekat dan tidak pernah dikirim atau disimpan ke server mana pun.


5. **Data Accuracy & Anti-Hallucination:**
* Seluruh teks sejarah, tahun berdiri, nama tokoh, alamat, jarak, dan harga harus 100% sesuai dengan dokumen referensi `ALUN_ALUN_CIANJUR.md`.



---

## 7. Scope

### 7.1. In-Scope (Termasuk dalam Pengerjaan Proyek)

1. Pengembangan aplikasi web *mobile-first* (SPA/PWA) menggunakan React 18, Vite, Tailwind CSS, dan Leaflet.js.


2. Penyusunan basis data terpadu `src/data/cianjur-data.json` yang mencakup 16 ikon sejarah (8 internal Alun-Alun, 8 eksternal cagar budaya), 10 kuliner khas, 12 hotel sekitar alun-alun, 8 titik awal tong sampah di 6 zona klaster, dan 5 misi interaktif.
3. Fitur pencari tong sampah terdekat berbasis GPS *Haversine* dan penunjuk garis rute (*polyline*) di atas peta.
4. Fitur pemandu suara sejarah otomatis menggunakan *Web Speech API* (`id-ID`).
5. Kalkulator status operasional kuliner (*Buka/Tutup*) otomatis berdasarkan waktu perangkat.
6. Sistem gamifikasi 5 misi K5 berbasis `localStorage` dan generator sertifikat digital HTML5 `<canvas>`.
7. Halaman utilitas tersembunyi `/admin-mapper` untuk pengambilan titik koordinat tong sampah di lapangan oleh tim Sultan.
8. Deployment ke Edge CDN berkecepatan tinggi dengan HTTPS aktif (Vercel / Cloudflare Pages), konfigurasi domain kustom, serta pembuatan 4 desain kode QR siap cetak untuk gerbang Alun-Alun.

### 7.2. Out-of-Scope (Tidak Termasuk dalam Pengerjaan Proyek)

1. Pembuatan sistem registrasi akun pengguna, login email/media sosial, atau penyimpanan profil di database server eksternal.
2. Sistem pemesanan kamar hotel langsung (*booking engine*) atau pembayaran makanan daring (*payment gateway*) di dalam aplikasi (seluruh transaksi diarahkan ke lokasi/Google Maps).
3. Pembuatan aplikasi *native* terpisah untuk Google Play Store (`.apk`/`.aab`) atau Apple App Store (`.ipa`).
4. Pelacakan kepenuhan volume tong sampah menggunakan sensor perangkat keras IoT fisik.
5. Perekaman sulih suara manusia (*studio voice-over* file MP3 manual) untuk narasi sejarah.

```

---

### Dokumen 2: `ALUN_ALUN_CIANJUR.md` (Ground-Truth Knowledge Base untuk AI Agent)
Simpan blok di bawah ini sebagai file **`ALUN_ALUN_CIANJUR.md`** berdampingan dengan `PRD.md` agar AI Agent kamu memiliki referensi data yang akurat saat menulis kode dan menyusun `cianjur-data.json`:

```markdown
# Knowledge Base & Ground Truth: Alun-Alun Cianjur (`ALUN_ALUN_CIANJUR.md`)

> **INSTRUKSI KERAS UNTUK AI AGENT:**
> Dokumen ini adalah SATU-SATUNYA sumber kebenaran (*Single Source of Truth*) untuk seluruh data geografis, sejarah, kuliner, hotel, tong sampah, dan kuis di dalam aplikasi.
> 1. **JANGAN BERHALUSINASI** atau menambahkan nama tempat, tahun sejarah, nama tokoh, nama jalan, maupun harga di luar dokumen ini.
> 2. Gunakan seluruh atribut, koordinat, jarak, jam operasional, dan narasi di bawah ini secara presisi untuk membangun `src/data/cianjur-data.json` dan komponen antarmuka aplikasi.

---

## 1. Identitas, Sejarah Transformasi & Filosofi Kawasan Alun-Alun Cianjur
- **Koordinat Pusat Referensi (Center Point):** `[-6.821111, 107.140000]` (Kompleks Masjid Agung & Alun-Alun Cianjur).
- **Luas Kawasan:** Lebih dari 4 hektar.
- **Sejarah Kolonial & Transformasi Pasar Induk Cianjur (PIC):**
  - Alun-Alun Cianjur dibangun oleh pemerintah kolonial Hindia Belanda pada tahun 1800-an saat Cianjur menjadi ibu kota Karesidenan Priangan dan dilintasi jalur raya pos *De Groote Postweg* (Anyer–Panarukan, 1808–1811). Tercatat pula pembangunan taman alun-alun pada tahun 1919 oleh wedana Raden Adipati Aria Soerjoatmodjo sebagai tempat upacara peringatan.
  - Sejak berdiri hingga kini, Alun-Alun Cianjur telah mengalami 7 kali perubahan/renovasi.
  - Sebelum revitalisasi modern, sisi timur alun-alun merupakan lokasi **Pasar Induk Cianjur (PIC)** tempat hampir 4.000 pedagang, tukang parkir, tukang becak, pemilik delman, dan kuli angkut mencari nafkah. Pada awal 2013, rencana relokasi PIC oleh Bupati Tjetjep Muchtar Soleh ke Pasar Induk Pasirhayam ditentang pedagang, namun pada Selasa dini hari, **27 Agustus 2013 pukul 01.30 WIB**, kebakaran hebat menghanguskan seluruh bangunan PIC.
  - Di atas lahan eks PIC tersebut dibangun perluasan Taman Alun-Alun Cianjur yang diresmikan langsung oleh **Presiden Joko Widodo** didampingi Gubernur Jawa Barat Ridwan Kamil dan Bupati Herman Suherman pada **8 Februari 2019**.
- **Kosmologi Tata Ruang:** Alun-alun merepresentasikan dimensi horizontal (sosial, budaya, politik), **Masjid Agung** di sisi barat menghadap ke timur merepresentasikan dimensi vertikal (ketuhanan), sedangkan **Pendopo Kabupaten** di sisi selatan menghadap ke utara dan tidak membelakangi masjid.
- **Tiga Pilar Budaya Cianjur:**
  1. **Ngaos:** Tradisi mengaji Al-Qur'an dan mempelajari ilmu pengetahuan (*Iqra*) yang berakar dari identitas Cianjur sebagai Kota Santri.
  2. **Mamaos:** Seni vokal Tembang Cianjuran dengan instrumen kecapi dan suling untuk syiar agama (*"syiar melalui syair"* oleh Dalem Pancaniti) dan kehalusan budi.
  3. **Maenpo:** Seni bela diri pencak silat asli Cianjur yang mengutamakan disiplin, kejujuran, kendali diri, dan prinsip *"mengalahkan tanpa menyakiti"*.
- **Budaya K5 & Kebijakan Buka-Tutup:** Pemerintah Daerah (DLH & Satpol PP) mengampanyekan **Budaya K5 (Kebersihan, Keindahan, Keamanan, Ketertiban, dan Kenyamanan)** serta menerapkan kebijakan buka-tutup berkala untuk pemeliharaan fasilitas dan penertiban kawasan.

---

## 2. Titik Gerbang Masuk Utama (Parameter QR `?gate=`)
1. `suroso` — **Gerbang Timur (Jalan Suroso)** | Koordinat: `[-6.821100, 107.140650]` | Gerbang kuning keemasan di sisi timur, akses utama dari koridor Jalan Suroso.
2. `masjid-selatan` — **Gerbang Selatan Masjid Agung (Jalan Siti Jenab)** | Koordinat: `[-6.821550, 107.139950]` | Gerbang sisi selatan yang berhadapan dengan koridor Jalan Siti Jenab, Pendopo Kabupaten, Lonceng 1774, dan Kantor Pos.
3. `masjid-utara` — **Gerbang Utara Masjid Agung** | Koordinat: `[-6.820650, 107.139900]` | Gerbang sisi utara dekat Panggung Suling dan deretan Lumbung Padi.

---

## 3. Basis Data 16 Ikon Sejarah & Cagar Budaya (`heritage_icons[]`)

### A. Zona Internal (`zone: "INTERNAL"` — Di Dalam Kompleks Alun-Alun)
1. **`ICN-01` | Monumen Al-Qur'an & Kolam Perahu**
   - **Pilar:** `NGAOS` | **Tahun:** `2019` | **Jarak:** `10 m` | **Koordinat:** `[-6.821111, 107.140150]`
   - **Ringkasan Sejarah:** *Sculpture* Al-Qur'an raksasa di tengah kolam berbentuk perahu dengan air mancur dan lampu hias. Berfungsi sebagai penyejuk di area terbuka tanpa pohon teduh sekaligus simbol utama pilar budaya *Ngaos*[cite: 2].
2. **`ICN-02` | Lorong 99 Tiang Asmaul Husna**
   - **Pilar:** `NGAOS` | **Tahun:** `2019` | **Jarak:** `35 m` | **Koordinat:** `[-6.821111, 107.139800]`
   - **Ringkasan Sejarah:** Deretan tiang bertuliskan 99 Asmaul Husna yang menggabungkan halaman Masjid Agung dan lapangan Alun-Alun menjadi satu kesatuan ruang terbuka religius dan spot swafoto.
3. **`ICN-03` | Tiga Gerbang Megah Alun-Alun**
   - **Pilar:** `HERITAGE` | **Tahun:** `2019` | **Jarak:** `50 m` | **Koordinat:** `[-6.821100, 107.140650]`
   - **Ringkasan Sejarah:** Tiga akses masuk utama dengan gerbang menjulang berwarna kuning keemasan di Jalan Suroso (timur), sisi selatan Masjid Agung, dan sisi utara Masjid Agung.
4. **`ICN-04` | Menara Pandang (Menara Obor)**
   - **Pilar:** `HERITAGE` | **Tahun:** `2019` | **Jarak:** `45 m` | **Koordinat:** `[-6.821250, 107.140450]`
   - **Ringkasan Sejarah:** Bangunan menjulang tinggi berwarna putih menyerupai bentuk obor di sisi timur/tengah kawasan untuk menikmati pemandangan sekitar Alun-Alun dari ketinggian.
5. **`ICN-05` | Panggung & Tribun Koloseum**
   - **Pilar:** `MAENPO` | **Tahun:** `2019` | **Jarak:** `55 m` | **Koordinat:** `[-6.821350, 107.140300]`
   - **Ringkasan Sejarah:** Panggung pertunjukan dengan tribun melingkar menyerupai Koloseum di Roma, Italia, berbentuk cekungan menjorok ke dalam dengan titik tengah sebagai panggung ekspresi budaya dan seni bela diri Maenpo[cite: 2].
6. **`ICN-06` | Panggung Suling & Lumbung Padi**
   - **Pilar:** `MAMAOS` | **Tahun:** `2019` | **Jarak:** `60 m` | **Koordinat:** `[-6.820750, 107.140200]`
   - **Ringkasan Sejarah:** Panggung di sisi utara berlatar ornamen suling berukuran besar (simbol kesenian *Mamaos*) yang di depannya berderet bangunan menyerupai lumbung padi ke arah selatan.
7. **`ICN-07` | Hamparan Rumput Sintetis & Taman Anak**
   - **Pilar:** `HERITAGE` | **Tahun:** `2019` | **Jarak:** `5 m` | **Koordinat:** `[-6.821050, 107.140050]`
   - **Ringkasan Sejarah:** Zona rekreasi keluarga berlapis rumput hijau sintetis, dilengkapi jalur pedestrian dan *jogging track* ramah disabilitas, taman bermain anak, serta instalasi huruf raksasa "Cianjur".
8. **`ICN-08` | Masjid Agung Cianjur**
   - **Pilar:** `NGAOS` | **Tahun:** `1810 M (1290 H)` | **Jarak:** `65 m` | **Koordinat:** `[-6.821111, 107.139450]` | **Quiz ID:** `MSN-01`
   - **Ringkasan Sejarah:** Masjid tertua di Cianjur yang berdiri sejak 1810 M di atas tanah wakaf **Nyi Raden Siti Bodedar** binti Kangjeng Dalem Sabiruddin (Bupati Cianjur ke-4). Awalnya berukuran 20x20 m (400 m²), mengalami 7 kali renovasi (termasuk pasca letusan Gunung Gede dan renovasi 1997) hingga kini seluas 2.500–4.000 m² berkapasitas 4.000 jamaah dengan perpaduan arsitektur Sunda, Jawa, Banten, dan Turki.

### B. Zona Eksternal (`zone: "EXTERNAL"` — Cagar Budaya & Ikon Sekitar Kota)
9. **`ICN-09` | Pendopo Kabupaten & Situs Badak Putih**
   - **Pilar:** `HERITAGE` | **Tahun:** `~1780` | **Jarak:** `90 m` | **Alamat:** `Jl. Siti Jenab, Kp. Kebon Kembang, Kel. Pamoyanan` | **Koordinat:** `[-6.821850, 107.139950]`
   - **Ringkasan Sejarah:** Pusat pemerintahan yang dibangun sekitar 1780 pasca gempa bumi 1779, berakar dari sejarah Bupati pertama Raden Aria Wiratanudatar I (Raden Jayasasana). Bergaya Sunda-Eropa menghadap utara, menyimpan mata air **Situs Pangguyangan Badak Putih**, kolam, batu tegak, dan dua *buyung* batu kuncup bunga setinggi ~70 cm.
10. **`ICN-10` | Lonceng Batavia 1774 (Tugu Lonceng)**
    - **Pilar:** `HERITAGE` | **Tahun:** `1774` | **Jarak:** `85 m` | **Alamat:** `Jl. Siti Jenab (Dalam pagar utara Pendopo, belakang pos Satpol PP)` | **Koordinat:** `[-6.821680, 107.139880]` | **Quiz ID:** `MSN-02`
    - **Ringkasan Sejarah:** Lonceng logam bercat emas (diameter mulut ~70 cm, pangkal 40 cm, tinggi ~60 cm) tergantung pada dua tiang beton putih setinggi 4 meter (50x50 cm). Memiliki inskripsi Belanda `• I • COCETEM • IN • T • AMBAC…..OUARTIT • TOT • BATAVIA • 1774 •` dan masih aktif menjadi penanda jam kerja pemkab.
11. **`ICN-11` | Kantor Pos Cianjur**
    - **Pilar:** `HERITAGE` | **Tahun:** `~1880-an` | **Jarak:** `95 m` | **Alamat:** `Jl. Siti Jenab (Sebelah Pendopo, seberang Masjid Agung)` | **Koordinat:** `[-6.821720, 107.139550]`
    - **Ringkasan Sejarah:** Dahulu bernama *Post en Telegraafkantoor te Tjiandjoer*, kantor utama pelayanan pos dan telegraf seluruh wilayah Priangan di jalur pos Anyer–Panarukan yang menyimpan koleksi prangko dan benda pos bersejarah.
12. **`ICN-12` | Bumi Ageung Cikidang**
    - **Pilar:** `HERITAGE` | **Tahun:** `1886` | **Jarak:** `850 m` | **Alamat:** `Jl. Moch. Ali No. 64 (eks Jl. Shanghai), Kel. Solokpandan` | **Koordinat:** `[-6.819500, 107.142500]` | **Quiz ID:** `MSN-05`
    - **Ringkasan Sejarah:** Rumah peristirahatan Bupati Cianjur ke-10 **R.A.A. Prawiradiredja II** (menjabat 1862–1910) berbahan kayu Rasamala yang diwariskan tahun 1910 kepada putrinya, **Raden Ayu Tjitjih Wiarsih (Juag Tjitjih)**. Menjadi lokasi pembentukan **PETA (1943–1945)** oleh Gatot Mangkoepradja, tempat perlindungan manula/perempuan/anak saat kerusuhan 1962–1963, dan ditetapkan sebagai Cagar Budaya.
13. **`ICN-13` | Gedung Wisma Karya**
    - **Pilar:** `HERITAGE` | **Tahun:** `1950-an` | **Jarak:** `500 m` | **Alamat:** `Jl. Moh. Ali, Kp. Cikidang` | **Koordinat:** `[-6.822500, 107.142222]`
    - **Ringkasan Sejarah:** Gedung serbaguna yang dibangun warga keturunan Tionghoa menyatu dengan bekas sekolah Cina di bagian belakangnya (menyisakan detail atap arsitektur Cina di ujung barat laut). Sempat menjadi pusat kegiatan KAMI/KAPI tahun 1966 dan kini menjadi gedung olahraga tenis meja.
14. **`ICN-14` | Vihara Bhumi Pharsjia (Hok Tek Bio)**
    - **Pilar:** `HERITAGE` | **Tahun:** `Era Pecinan Lama` | **Jarak:** `400 m` | **Alamat:** `Jl. Mangunsarkoro No. 60–62, Kel. Pamoyanan` | **Koordinat:** `[-6.818800, 107.139600]`
    - **Ringkasan Sejarah:** Wihara Buddha berarsitektur Tiongkok dengan atap pelana kuda, hiasan naga, flora-fauna, serta dominasi warna merah dan kuning menyala yang menghadap ke timur.
15. **`ICN-15` | Stasiun Cianjur & Tugu Kereta (Tugu Thomas)**
    - **Pilar:** `HERITAGE` | **Tahun:** `Era Hindia Belanda` | **Jarak:** `600 m` | **Alamat:** `Jl. Yulius Usman, Kel. Sayang` | **Koordinat:** `[-6.821667, 107.146667]`
    - **Ringkasan Sejarah:** Stasiun cagar budaya bergaya *Hindia Baru* (Kode: CJ 1510, Kelas II, km 95+775, ketinggian +439 mdpl) di lintas Bogor–Sukabumi–Cianjur–Bandung yang masih menggunakan persinyalan mekanik *Siemens & Halske* manual. Di dekatnya berdiri Tugu Kereta Api yang dijuluki warga sebagai "Tugu Thomas".
16. **`ICN-16` | Tugu Tauco Cianjur**
    - **Pilar:** `HERITAGE` | **Tahun:** `2016/2017 (Revitalisasi 2023)` | **Jarak:** `1200 m` | **Alamat:** `Simpang Jl. Dr. Muwardi & Jl. HOS Cokroaminoto` | **Koordinat:** `[-6.814500, 107.143800]`
    - **Ringkasan Sejarah:** Menggantikan Tugu KB dan Tugu Bubur lama. Menampilkan empat replika botol tauco raksasa yang menumpahkan isinya sebagai penegas identitas Cianjur sebagai kampung halaman kuliner fermentasi kedelai.

---

## 4. Basis Data 10 Kuliner Khas Sekitar Alun-Alun (`culinary_spots[]`)

1. **`CUL-01` | Bubur Ayam Sampurna (Bojongmeron)**
   - **Alamat:** `Jl. H. Agus Saleh No. 48, Bojongmeron, Kel. Solokpandan` | **Jarak:** `500 m` | **Koordinat:** `[-6.817800, 107.140500]`
   - **Harga:** `Rp8.000 - Rp29.500` (`min_price: 8000`) | **Jam Buka:** Hari `[0,1,2,3,4,5,6]`, `06:00` – `21:30` WIB.
   - **Menu Andalan:** `["Bubur Ayam Spesial Ati Ampela (Rp24.500)", "Pepes Bawang Usus", "Karoket (Rp3.000)", "Telur Kampung Mentah (Rp8.500)", "Sop Duren (Rp25.000-Rp29.500)"]`.
   - **Catatan Sejarah:** Melegenda sejak **1975**, menggunakan beras Pandanwangi khas Cianjur yang dimasak menjadi bubur kental gurih **tanpa kuah kuning** dengan pelengkap pepes bawang usus dan karoket.
2. **`CUL-02` | Geco Nusasari Pak Iding**
   - **Alamat:** `Jl. Siti Jenab No. 24, Pamoyanan (Dekat Alun-Alun / Pasar Pelita)` | **Jarak:** `150 m` | **Koordinat:** `[-6.821950, 107.139100]`
   - **Harga:** `Mulai Rp10.000` (`min_price: 10000`) | **Jam Buka:** Hari `[0,1,2,3,4,5,6]`, `08:30` – `16:00` WIB.
   - **Menu Andalan:** `["Geco (Tauge & Tauco) Ketupat", "Mie Aci Kuah Tauco", "Tahu & Kentang Bumbu Tauco"]`.
   - **Catatan Sejarah:** **Geco** adalah akronim dari *tauge* dan *tauco*—hidangan ketupat, mi aci, tauge rebus, tahu, dan kentang berkuah tauco gurih-manis-asam segar yang paling dekat dari sisi selatan Alun-Alun.
3. **`CUL-03` | Sate Maranggi Warujajar Ma' Nunung**
   - **Alamat:** `Jl. K.H. Hasyim Asy'ari No. 13, Warujajar, Kel. Solokpandan` | **Jarak:** `450 m` | **Koordinat:** `[-6.821800, 107.143200]`
   - **Harga:** `Mulai Rp3.000 / tusuk` (`min_price: 15000`) | **Jam Buka:** Hari `[0,1,2,3,4,5,6]`, `06:30` – `22:30` WIB.
   - **Menu Andalan:** `["Sate Maranggi Full Daging Sapi", "Sate Maranggi Campur Lemak", "Nasi Uduk Hangat", "Ketan"]`.
   - **Catatan Sejarah:** Terhubung dari koridor timur Jl. Suroso, warung legendaris ini menjual hingga **3.000 tusuk setiap hari** dan disajikan dengan nasi uduk atau ketan.
4. **`CUL-04` | Toko Roti Tan Keng Cu (1926)**
   - **Alamat:** `Jl. HOS Cokroaminoto No. 95, Kel. Muka` | **Jarak:** `850 m` | **Koordinat:** `[-6.817200, 107.143100]`
   - **Harga:** `Mulai Rp10.000` (`min_price: 10000`) | **Jam Buka:** Hari `[0,2,3,4,5,6]` (**TUTUP HARI SENIN** / `day: 1` tutup), `09:30` – `20:30` WIB (Disarankan datang sebelum pukul 13.00 siang).
   - **Menu Andalan:** `["Roti Manis Klasik", "Roti Tawar Kuno", "Roti Susu Dingin"]`.
   - **Catatan Sejarah:** Berdiri sejak **1926** dan dahulu menjadi pemasok roti bagi tentara Belanda se-Jawa Barat; dapat dicapai dengan berjalan kaki melalui gang dari Bumi Ageung Cikidang.
5. **`CUL-05` | Pusat Oleh-Oleh Tauco Cap Meong (Ny. Tasma) & Kedai Geco Cap Meong**
   - **Alamat:** `Jl. HOS Cokroaminoto No. 160, Kel. Solokpandan` | **Jarak:** `1050 m` | **Koordinat:** `[-6.815800, 107.143500]`
   - **Harga:** `Rp15.400 - Rp50.000 (Tauco Botol Rp22.000)` (`min_price: 15400`) | **Jam Buka:** Hari `[0,1,2,3,4,5,6]`, `07:30` – `20:00` WIB.
   - **Menu Andalan:** `["Tauco Botol Cap Meong 330ml (Rp22.000)", "Geco Banjur (Rp25.000)", "Bala-bala Bumbu Kacang (Rp19.000)", "Roti Panggang (Rp15.400)", "Sari Pala & Sari Markisa (Rp17.600)"]`.
   - **Catatan Sejarah:** Berdiri sejak **1880** oleh pasangan **Tan Kei Hian (Babah Tasma)** dan **Tjoa Kim Nio (Nyonya Tasma)**, kini dikelola generasi ke-5 (Frans/Frank & Stefany Tasma). Nama **"Cap Meong"** (Macan) digunakan sekitar 1935 saat diwariskan ke putrinya (Tan Bei Nio / Betsi Tasma) setelah ditemukan tapak kaki macan di dapur yang diyakini peliharaan Eyang Suryakencana. Kedelai difermentasi 4 bulan dalam guci berusia seabad dan dimasak kayu bakar (100 kg/hari).
6. **`CUL-06` | Dwigie Tauco Cookies**
   - **Alamat:** `Jl. Mangunsarkoro Gg. Melati No. 1, Kel. Pamoyanan` | **Jarak:** `420 m` | **Koordinat:** `[-6.818500, 107.139400]`
   - **Harga:** `Mulai Rp20.000` (`min_price: 20000`) | **Jam Buka:** Hari `[0,1,2,3,4,5,6]`, `08:00` – `20:00` WIB.
   - **Menu Andalan:** `["Kue Kering Tauco Manis-Gurih", "Cookies Oleh-Oleh Khas Cianjur"]`.
   - **Catatan Sejarah:** Kreasi oleh-oleh modern yang mengolah tauco legendaris Cianjur menjadi kue kering di koridor Jalan Mangunsarkoro.
7. **`CUL-07` | Rogan Soup (Roti Degan)**
   - **Alamat:** `Jl. Selamet No. 27, Cianjur` | **Jarak:** `350 m` | **Koordinat:** `[-6.822900, 107.141500]`
   - **Harga:** `Mulai Rp12.000` (`min_price: 12000`) | **Jam Buka:** Hari `[0,1,2,3,4,5,6]`, `08:00` – `21:00` WIB.
   - **Menu Andalan:** `["Rogan Soup (Roti, Kelapa Muda/Degan, Kacang Hijau, Kolang-Kaling & Susu Bungkus Daun Pisang)"]`.
   - **Catatan Sejarah:** Kudapan hangat manis khas Cianjur berbungkus daun pisang di dekat kawasan Bojongherang.
8. **`CUL-08` | Laksa Kang Aam**
   - **Alamat:** `Jl. Siliwangi No. 47A, Kel. Sawah Gede` | **Jarak:** `950 m` | **Koordinat:** `[-6.824500, 107.136500]`
   - **Harga:** `Mulai Rp12.000` (`min_price: 12000`) | **Jam Buka:** Hari `[1,2,3,4,5,6]` (Senin–Sabtu, Minggu Tutup), `09:00` – `14:00` WIB.
   - **Menu Andalan:** `["Laksa Cianjur Kuah Kuning Santan", "Bihun, Tauge, Kemangi, Oncom & Telur Rebus"]`.
   - **Catatan Sejarah:** Sajian laksa khas Sunda Cianjur dengan aroma kemangi dan oncom yang kuat untuk makan siang.
9. **`CUL-09` | Bubur Ayam Mang Ade Suge**
   - **Alamat:** `Jl. Taifur Yusuf, Kel. Pamoyanan` | **Jarak:** `380 m` | **Koordinat:** `[-6.822200, 107.138200]`
   - **Harga:** `Mulai Rp6.000` (`min_price: 6000`) | **Jam Buka:** Hari `[0,1,2,3,4,5,6]`, `06:00` – `22:00` WIB.
   - **Menu Andalan:** `["Bubur Ayam Cianjur Ekonomis", "Sate Usus & Ati"]`.
   - **Catatan Sejarah:** Alternatif bubur ayam khas Cianjur yang sangat ramah kantong di Kelurahan Pamoyanan.
10. **`CUL-10` | Bubur Ayam Lestari (24 Jam) & Es Campur Mang Bace (1947)**
    - **Alamat:** `Jl. Dr. Muwardi No. 133, Cianjur` | **Jarak:** `1100 m` | **Koordinat:** `[-6.816200, 107.145200]`
    - **Harga:** `Rp6.500 - Rp9.000` (`min_price: 6500`) | **Jam Buka:** Hari `[0,1,2,3,4,5,6]`, `00:00` – `23:59` WIB (**Buka 24 Jam**).
    - **Menu Andalan:** `["Bubur Ayam 24 Jam", "Topping Risoles & Kerupuk", "Referensi Kuliner Klasik: Es Campur Mang Bace (Sejak 1947)"]`.
    - **Catatan Sejarah:** Pilihan utama kuliner malam dan dini hari bagi wisatawan yang tiba di Cianjur kapan saja.

---

## 5. Basis Data 12 Hotel & Penginapan Sekitar Alun-Alun (`hotels[]`)

1. **`HTL-01` | Alamii Kaoem Guest House** — `Kawasan Kaum, Pusat Kota Cianjur` | Jarak: `172 m` | Koordinat: `[-6.820800, 107.138600]` | Rating: `8.6` | Harga Mulai: `183707` (Rp183.707 – Rp213.432) | Fasilitas: `["Jalan Kaki ke Alun-Alun", "WiFi", "AC", "Fasilitas Bisnis"]`.
2. **`HTL-02` | Shine BnB** — `Jl. Selamat No. 60, Kel. Bojongherang` | Jarak: `290 m` | Koordinat: `[-6.822600, 107.141800]` | Rating: `8.4` (2.200+ ulasan) | Harga Mulai: `242000` (Rp242.000 – Rp309.121) | Fasilitas: `["Kafe & Restoran", "WiFi Gratis", "Parkir Mobil", "Jalan Kaki ke Alun-Alun"]`.
3. **`HTL-03` | Cordela Suites Cianjur** — `Jl. Yulius Usman No. 28, Kel. Sayang` | Jarak: `502 m` (59–176 m dari Stasiun Cianjur) | Koordinat: `[-6.821500, 107.145500]` | Rating: `9.3` | Harga Mulai: `495000` (Rp495.000 – Rp569.434) | Fasilitas: `["Kolam Renang Outdoor", "Restoran Mr. Ebood Platinum", "Dekat Stasiun", "Lift", "Resepsionis 24 Jam"]`.
4. **`HTL-04` | OYO 94802 Hotel Prima** — `Pusat Kota Cianjur` | Jarak: `676 m` | Koordinat: `[-6.824200, 107.142500]` | Rating: `8.1` (31 ulasan) | Harga Mulai: `108000` (Rp108.000) | Fasilitas: `["Ultra-Budget", "TV", "Resepsionis", "Opsi Suite Keluarga"]`.
5. **`HTL-05` | Bydiel Hotel** — `Jl. Ir. H. Juanda No. 70A, Kel. Mekarsari` | Jarak: `800 m` | Koordinat: `[-6.816500, 107.136200]` | Rating: `8.0` (562 ulasan) | Harga Mulai: `153000` (Rp153.000 – Rp230.000) | Fasilitas: `["Restoran", "Layanan Kamar", "Dapur & Kulkas (Tipe Tertentu)"]`.
6. **`HTL-06` | Mulyadi Suites Cianjur** — `Pusat Kota Cianjur` | Jarak: `910 m` | Koordinat: `[-6.815200, 107.138500]` | Rating: `9.0` (93 ulasan) | Harga Mulai: `393280` (Rp393.280) | Fasilitas: `["Premium Suites", "Kebersihan Tinggi", "AC", "WiFi"]`.
7. **`HTL-07` | Green Costel** — `Jl. Dr. Muwardi Bypass No. 124, Bojongherang` | Jarak: `1000 m` | Koordinat: `[-6.817500, 107.146800]` | Rating: `8.4` (320 ulasan) | Harga Mulai: `274000` (Rp274.000 – Rp347.086) | Fasilitas: `["Parkir Luas Bypass", "Restoran", "WiFi Gratis", "AC"]`.
8. **`HTL-08` | Super OYO 1898 Louise Place** — `Pusat Kota Cianjur` | Jarak: `1120 m` | Koordinat: `[-6.814800, 107.142200]` | Rating: `8.0` (242 ulasan) | Harga Mulai: `165000` | Fasilitas: `["Check-out Ekspres", "Parkir Mobil", "Dekat Penjual Makanan"]`.
9. **`HTL-09` | Hotel Gino Feruci Cianjur (Bintang 4)** — `Jl. K.H. Abdullah Bin Nuh No. 46, Kel. Pamoyanan` | Jarak: `1180 m` (495 m dari Citimall) | Koordinat: `[-6.824800, 107.131800]` | Rating: `9.1` (1.390 ulasan) | Harga Mulai: `493000` (Rp493.000 – Rp866.580) | Fasilitas: `["Hotel Bintang 4", "Kolam Renang Dewasa & Anak", "Gym & Spa", "Ballroom", "Restoran"]`.
10. **`HTL-10` | TW Penginapan Syariah (TW 2)** — `Jl. Gunung Gede No. 22, Kel. Sawah Gede` | Jarak: `1450 m` | Koordinat: `[-6.826500, 107.134500]` | Rating: `7.8` (104 ulasan) | Harga Mulai: `128000` (Rp128.000) | Fasilitas: `["Syariah", "WiFi Gratis", "Parkir Gratis", "Resepsionis 24 Jam"]`.
11. **`HTL-11` | TW Hotel & Humbly Hotel** — `Jl. K.H. Abdullah Bin Nuh No. 8, Rancagoong` | Jarak: `2850 m` | Koordinat: `[-6.832500, 107.128500]` | Rating: `8.6` | Harga Mulai: `190000` (Rp190.000 – Rp284.113) | Fasilitas: `["Restoran", "Sewa Mobil", "Layanan Pijat", "Parkir Luas"]`.
12. **`HTL-12` | Miracle Hotel Cianjur** — `Pusat Kota Cianjur` | Jarak: `3170 m` | Koordinat: `[-6.835000, 107.127000]` | Rating: `8.8` (53 ulasan) | Harga Mulai: `298041` (Rp298.041 – Rp482.663) | Fasilitas: `["Kolam Renang", "Ramah Disabilitas", "Fasilitas Bisnis"]`.

---

## 6. Sebaran 8 Titik Tong Sampah di 6 Zona Klaster (`trash_bins[]`)
1. `BIN-SRS-01` | **Klaster 1: Koridor Gerbang Utama Jalan Suroso** | `[-6.821080, 107.140600]` | Tipe: `ORGANIK_ANORGANIK` | Hint: `"Di sisi dalam Gerbang Utama Jalan Suroso sebelah kanan jalur masuk"`.
2. `BIN-ASH-01` | **Klaster 2: Koridor 99 Tiang Asmaul Husna (Utara)** | `[-6.820850, 107.139820]` | Tipe: `ORGANIK_ANORGANIK` | Hint: `"Di ujung utara Lorong 99 Tiang Asmaul Husna dekat selasar Masjid Agung"`.
3. `BIN-ASH-02` | **Klaster 2: Koridor 99 Tiang Asmaul Husna (Selatan)** | `[-6.821350, 107.139820]` | Tipe: `ORGANIK_ANORGANIK` | Hint: `"Di ujung selatan Lorong 99 Tiang Asmaul Husna arah Gerbang Selatan"`.
4. `BIN-QRN-01` | **Klaster 3: Perimeter Rumput Sintetis & Kolam Al-Qur'an (Timur)** | `[-6.821000, 107.140200]` | Tipe: `ORGANIK_ANORGANIK` | Hint: `"Di tepi jalur pedestrian timur lapangan rumput sintetis dekat Kolam Perahu Al-Qur'an"`.
5. `BIN-QRN-02` | **Klaster 3: Perimeter Rumput Sintetis (Barat)** | `[-6.821220, 107.139980]` | Tipe: `UMUM` | Hint: `"Di tepi barat jalur jogging track dekat bangku taman keluarga"`.
6. `BIN-KOL-01` | **Klaster 4: Zona Tribun Koloseum & Menara Pandang** | `[-6.821320, 107.140380]` | Tipe: `ORGANIK_ANORGANIK` | Hint: `"Di antara tangga masuk Tribun Koloseum dan kaki Menara Pandang putih"`.
7. `BIN-SLG-01` | **Klaster 5: Zona Utara Panggung Suling, Lumbung Padi & Taman Anak** | `[-6.820720, 107.140150]` | Tipe: `ORGANIK_ANORGANIK` | Hint: `"Di dekat deretan Lumbung Padi dan area taman bermain anak sisi utara"`.
8. `BIN-STJ-01` | **Klaster 6: Perimeter Trotoar Jalan Siti Jenab** | `[-6.821600, 107.140050]` | Tipe: `ORGANIK_ANORGANIK` | Hint: `"Di sepanjang trotoar luar Jalan Siti Jenab dekat Gerbang Selatan (jalur angkut truk kebersihan DLH)"`.

---

## 7. Spesifikasi 5 Misi Interaktif & Kunci Jawaban (`missions[]`)
1. **`MSN-01` | Jejak Santri: Rahasia Wakaf 1810** (`Ngaos` | `100 XP` | Badge: `Penjaga Pilar Ngaos` | Tipe: `QUIZ`)
   - **Pertanyaan:** `"Siapakah tokoh putri Bupati Cianjur ke-4 (Kangjeng Dalem Sabiruddin) yang mewakafkan tanah Masjid Agung Cianjur pada tahun 1810?"`
   - **Kunci Jawaban Valid (`answer_key`):** `["siti bodedar", "nyi raden siti bodedar"]`.
2. **`MSN-02` | Harmoni Nada & Lonceng Kolonial** (`Mamaos` | `150 XP` | Badge: `Maestro Mamaos & Sejarah` | Tipe: `QUIZ`)
   - **Pertanyaan:** `"Seberangi Jalan Siti Jenab menuju gerbang utara Pendopo Kabupaten. Berapakah 4 digit angka tahun pembuatan yang terukir pada Lonceng Batavia di sana?"`
   - **Kunci Jawaban Valid (`answer_key`):** `["1774"]`.
3. **`MSN-03` | Ksatria K5: Operasi Bersih Alun-Alun** (`Maenpo & Budaya K5` | `200 XP` | Badge: `Pahlawan Kebersihan K5` | Tipe: `GPS_TRASH_CHECKIN`)
   - **Instruksi:** `"Aktifkan filter Tong Sampah di Peta, berjalanlah menuju titik tong sampah terdekat untuk membuang sampah pada tempatnya demi menjaga Budaya K5, lalu tekan tombol Verifikasi Lokasi!"`.
4. **`MSN-04` | Legenda Kota Tauco 1880** (`Eksplorasi Kuliner` | `100 XP` | Badge: `Duta Kuliner Pandanwangi` | Tipe: `QUIZ`)
   - **Pertanyaan:** `"Jejak kaki hewan apakah yang ditemukan di dapur Nyonya Tasma sehingga melahirkan merek Tauco tertua di Cianjur sejak 1880?"`
   - **Kunci Jawaban Valid (`answer_key`):** `["meong", "macan", "harimau"]`.
5. **`MSN-05` | Jejak Pejuang PETA di Cikidang** (`Sejarah Perjuangan` | `150 XP` | Badge: `Sejarawan Tatar Cianjur` | Tipe: `QUIZ`)
   - **Pertanyaan:** `"Organisasi militer bela tanah air apakah yang dibentuk Gatot Mangkoepradja di rumah cagar budaya Bumi Ageung Cikidang (1886) pada tahun 1943–1945?"`
   - **Kunci Jawaban Valid (`answer_key`):** `["peta", "pembela tanah air"]`.

