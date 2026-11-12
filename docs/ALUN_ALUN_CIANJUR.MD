# Knowledge Base & Ground Truth: Alun-Alun Cianjur (`ALUN_ALUN_CIANJUR.md`)

> **INSTRUKSI KERAS UNTUK AI AGENT:**
> Dokumen ini adalah SATU-SATUNYA sumber kebenaran (*Single Source of Truth*) untuk seluruh data geografis, sejarah, kuliner, hotel, tong sampah, dan kuis di dalam aplikasi.
> 1. **JANGAN BERHALUSINASI** atau menambahkan nama tempat, tahun sejarah, nama jalan, maupun harga di luar dokumen ini.
> 2. Gunakan koordinat, angka jarak, jam operasional, dan teks sejarah persis seperti yang tertulis di bawah ini saat membuat `src/data/cianjur-data.json`.

---

## 1. Identitas & Tata Ruang Kawasan Alun-Alun Cianjur
- **Koordinat Pusat Referensi (Center Point):** `[-6.821111, 107.140000]` (Titik tengah kompleks Masjid Agung & Alun-Alun Cianjur).
- **Luas Kawasan:** Lebih dari 4 hektar.
- **Sejarah Transformasi:** Dibangun sejak era kolonial Hindia Belanda tahun 1800-an di jalur raya pos *De Groote Postweg* (Anyer–Panarukan, 1808–1811) dan tercatat mengalami 7 kali perubahan/renovasi. Sebelum revitalisasi modern, sisi timur alun-alun adalah lokasi **Pasar Induk Cianjur (PIC)** tempat hampir 4.000 pedagang menggantungkan hidup, yang terbakar hebat pada Selasa dini hari, **27 Agustus 2013 pukul 01.30 WIB**. Di atas lahan eks PIC tersebut dibangun perluasan Taman Alun-Alun Cianjur yang diresmikan oleh **Presiden Joko Widodo** bersama Gubernur Jawa Barat Ridwan Kamil dan Bupati Herman Suherman pada **8 Februari 2019**.
- **Filosofi Kosmologi:** Alun-alun (dimensi horizontal/sosial) berhadapan dengan **Masjid Agung** di sisi barat (dimensi vertikal/ketuhanan), sementara **Pendopo Kabupaten** di seberang selatan (Jl. Siti Jenab) menghadap utara dan tidak membelakangi masjid.
- **Tiga Pilar Budaya Cianjur:**
  1. **Ngaos:** Tradisi mengaji Al-Qur'an dan mempelajari ilmu pengetahuan (*Iqra*) sebagai identitas Kota Santri.
  2. **Mamaos:** Seni vokal Tembang Cianjuran dengan instrumen kecapi dan suling untuk syiar agama dan kehalusan budi.
  3. **Maenpo:** Seni bela diri pencak silat asli Cianjur yang mengutamakan disiplin, kendali diri, dan prinsip *"mengalahkan tanpa menyakiti"*.
- **Budaya K5:** Kampanye Pemerintah Daerah (DLH & Satpol PP) untuk menjaga **Kebersihan, Keindahan, Keamanan, Ketertiban, dan Kenyamanan** di Taman Alun-Alun Cianjur.

---

## 2. Titik Gerbang Masuk (Untuk Parameter QR `?gate=`)
1. `suroso`: **Gerbang Timur (Jalan Suroso)** — Koordinat: `[-6.821100, 107.140650]`. Akses utama dari koridor timur dan area perdagangan Jalan Suroso.
2. `masjid-selatan`: **Gerbang Selatan Masjid Agung (Jalan Siti Jenab)** — Koordinat: `[-6.821550, 107.139950]`. Akses terdekat dari Pendopo Kabupaten, Lonceng Batavia 1774, dan Kantor Pos.
3. `masjid-utara`: **Gerbang Utara Masjid Agung** — Koordinat: `[-6.820650, 107.139900]`. Akses dekat Panggung Suling, Lumbung Padi, dan koridor utara.

---

## 3. Data 16 Ikon Sejarah & Cagar Budaya (`heritage_icons[]`)

### A. Zona Internal (`zone: "INTERNAL"` - Di Dalam Kompleks Alun-Alun)
1. **`ICN-01` | Monumen Al-Qur'an & Kolam Perahu**
   - **Pilar:** `NGAOS` | **Tahun:** `2019` | **Jarak:** `10 m` | **Koordinat:** `[-6.821111, 107.140150]`
   - **Ringkasan Sejarah:** *Sculpture* Al-Qur'an raksasa di tengah kolam berbentuk perahu dengan air mancur dan lampu hias. Berfungsi sebagai penyejuk di area terbuka sekaligus simbol utama pilar budaya *Ngaos* di Kota Santri[cite: 2].
2. **`ICN-02` | Lorong 99 Tiang Asmaul Husna**
   - **Pilar:** `NGAOS` | **Tahun:** `2019` | **Jarak:** `35 m` | **Koordinat:** `[-6.821111, 107.139800]`
   - **Ringkasan Sejarah:** Deretan tiang bertuliskan 99 nama indah Allah (Asmaul Husna) yang menyatukan halaman Masjid Agung dan lapangan Alun-Alun menjadi satu kesatuan ruang ibadah dan publik.
3. **`ICN-03` | Tiga Gerbang Megah Alun-Alun**
   - **Pilar:** `HERITAGE` | **Tahun:** `2019` | **Jarak:** `50 m` | **Koordinat:** `[-6.821100, 107.140650]`
   - **Ringkasan Sejarah:** Tiga gerbang masuk menjulang berwarna kuning keemasan yang terletak di Jalan Suroso (timur), sisi selatan Masjid Agung, dan sisi utara Masjid Agung.
4. **`ICN-04` | Menara Pandang (Menara Obor)**
   - **Pilar:** `HERITAGE` | **Tahun:** `2019` | **Jarak:** `45 m` | **Koordinat:** `[-6.821250, 107.140450]`
   - **Ringkasan Sejarah:** Menara putih menjulang tinggi menyerupai bentuk obor di sisi timur/tengah kawasan yang dirancang untuk menikmati pemandangan sekitar Alun-Alun dari ketinggian.
5. **`ICN-05` | Panggung & Tribun Koloseum**
   - **Pilar:** `MAENPO` | **Tahun:** `2019` | **Jarak:** `55 m` | **Koordinat:** `[-6.821350, 107.140300]`[cite: 2]
   - **Ringkasan Sejarah:** Panggung pertunjukan budaya dengan tribun melingkar menyerupai Koloseum di Roma, Italia, berbentuk cekungan menjorok ke dalam untuk pentas seni dan pencak silat Maenpo[cite: 2].
6. **`ICN-06` | Panggung Suling & Lumbung Padi**
   - **Pilar:** `MAMAOS` | **Tahun:** `2019` | **Jarak:** `60 m` | **Koordinat:** `[-6.820750, 107.140200]`
   - **Ringkasan Sejarah:** Panggung di sisi utara berlatar ornamen suling raksasa sebagai simbol seni Tembang Cianjuran (*Mamaos*), dilengkapi deretan bangunan menyerupai lumbung padi ke arah selatan yang melambangkan kemakmuran pertanian Pandanwangi.
7. **`ICN-07` | Hamparan Rumput Sintetis & Taman Anak**
   - **Pilar:** `HERITAGE` | **Tahun:** `2019` | **Jarak:** `5 m` | **Koordinat:** `[-6.821050, 107.140050]`
   - **Ringkasan Sejarah:** Zona rekreasi keluarga berlapis rumput hijau sintetis, dilengkapi jalur pedestrian ramah disabilitas, *jogging track*, taman bermain anak, dan instalasi huruf raksasa "Cianjur".
8. **`ICN-08` | Masjid Agung Cianjur**
   - **Pilar:** `NGAOS` | **Tahun:** `1810 M` | **Jarak:** `65 m` | **Koordinat:** `[-6.821111, 107.139450]` | **Quiz ID:** `MSN-01`
   - **Ringkasan Sejarah:** Masjid tertua di Cianjur yang berdiri sejak 1810 M (1290 H) di atas tanah wakaf **Nyi Raden Siti Bodedar** binti Kangjeng Dalem Sabiruddin (Bupati Cianjur ke-4). Dari ukuran awal 20x20 m (400 m²), masjid ini mengalami 7 kali renovasi (termasuk pasca letusan Gunung Gede dan renovasi besar 1997) hingga kini seluas 2.500–4.000 m² berkapasitas 4.000 jamaah dengan perpaduan arsitektur Sunda, Jawa, Banten, dan Turki.

### B. Zona Eksternal (`zone: "EXTERNAL"` - Cagar Budaya & Ikon Sekitar Alun-Alun)
9. **`ICN-09` | Pendopo Kabupaten & Situs Badak Putih**
   - **Pilar:** `HERITAGE` | **Tahun:** `~1780` | **Jarak:** `90 m` | **Alamat:** `Jl. Siti Jenab, Kel. Pamoyanan` | **Koordinat:** `[-6.821850, 107.139950]`
   - **Ringkasan Sejarah:** Pusat pemerintahan Kabupaten Cianjur yang dibangun sekitar 1780 pasca gempa bumi 1779, berakar dari sejarah Bupati pertama Raden Aria Wiratanudatar I (Raden Jayasasana). Bergaya Sunda-Eropa menghadap utara, di dalamnya terdapat mata air keramat **Situs Pangguyangan Badak Putih**, batu tegak, dan dua *buyung* batu kuncup bunga setinggi ~70 cm.
10. **`ICN-10` | Lonceng Batavia 1774 (Tugu Lonceng)**
    - **Pilar:** `HERITAGE` | **Tahun:** `1774` | **Jarak:** `85 m` | **Alamat:** `Jl. Siti Jenab (Dalam pagar utara Pendopo, belakang pos Satpol PP)` | **Koordinat:** `[-6.821680, 107.139880]` | **Quiz ID:** `MSN-02`
    - **Ringkasan Sejarah:** Lonceng logam bercat emas (diameter mulut ~70 cm, tinggi ~60 cm) tergantung pada dua tiang beton putih setinggi 4 meter. Memiliki inskripsi Belanda bertuliskan `• I • COCETEM • IN • T • AMBAC…..OUARTIT • TOT • BATAVIA • 1774 •` dan masih aktif menjadi penanda jam kerja pemkab.
11. **`ICN-11` | Kantor Pos Cianjur**
    - **Pilar:** `HERITAGE` | **Tahun:** `~1880-an` | **Jarak:** `95 m` | **Alamat:** `Jl. Siti Jenab (Sebelah Pendopo, seberang Masjid Agung)` | **Koordinat:** `[-6.821720, 107.139550]`
    - **Ringkasan Sejarah:** Dahulu bernama *Post en Telegraafkantoor te Tjiandjoer*, kantor utama pelayanan pos dan telegraf seluruh Karesidenan Priangan di jalur pos Anyer–Panarukan yang menyimpan koleksi prangko dan benda pos bersejarah.
12. **`ICN-12` | Bumi Ageung Cikidang**
    - **Pilar:** `HERITAGE` | **Tahun:** `1886` | **Jarak:** `850 m` | **Alamat:** `Jl. Moch. Ali No. 64 (eks Jl. Shanghai), Kel. Solokpandan` | **Koordinat:** `[-6.819500, 107.142500]` | **Quiz ID:** `MSN-05`
    - **Ringkasan Sejarah:** Rumah peristirahatan Bupati Cianjur ke-10 **R.A.A. Prawiradiredja II** (menjabat 1862–1910) berbahan kayu Rasamala yang diwariskan tahun 1910 kepada putrinya, **Raden Ayu Tjitjih Wiarsih (Juag Tjitjih)**. Menjadi lokasi bersejarah pembentukan **PETA (1943–1945)** oleh Gatot Mangkoepradja dan tempat perlindungan warga saat kerusuhan 1962–1963.
13. **`ICN-13` | Gedung Wisma Karya**
    - **Pilar:** `HERITAGE` | **Tahun:** `1950-an` | **Jarak:** `500 m` | **Alamat:** `Jl. Moh. Ali, Kp. Cikidang` | **Koordinat:** `[-6.822500, 107.142222]`
    - **Ringkasan Sejarah:** Gedung serbaguna yang dibangun warga keturunan Tionghoa menyatu dengan bekas sekolah Cina di bagian belakangnya (menyisakan detail atap arsitektur Tionghoa di ujung barat laut). Pernah menjadi markas kegiatan KAMI/KAPI tahun 1966 dan kini digunakan sebagai gedung olahraga tenis meja.
14. **`ICN-14` | Vihara Bhumi Pharsjia (Hok Tek Bio)**
    - **Pilar:** `HERITAGE` | **Tahun:** `Era Pecinan Lama` | **Jarak:** `400 m` | **Alamat:** `Jl. Mangunsarkoro No. 60–62, Kel. Pamoyanan` | **Koordinat:** `[-6.818800, 107.139600]`
    - **Ringkasan Sejarah:** Wihara Buddha berarsitektur tradisional Tiongkok dengan atap pelana kuda, ornamen naga, serta dominasi warna merah dan kuning menyala yang menghadap ke timur di kawasan Pecinan Cianjur.
15. **`ICN-15` | Stasiun Cianjur & Tugu Kereta (Tugu Thomas)**
    - **Pilar:** `HERITAGE` | **Tahun:** `Era Hindia Belanda` | **Jarak:** `600 m` | **Alamat:** `Jl. Yulius Usman, Kel. Sayang` | **Koordinat:** `[-6.821667, 107.146667]`
    - **Ringkasan Sejarah:** Stasiun cagar budaya bergaya *Hindia Baru* (Kode: CJ 1510, Kelas II, ketinggian +439 mdpl) di lintas Bogor–Sukabumi–Cianjur–Bandung yang masih mengoperasikan persinyalan mekanik *Siemens & Halske* manual. Di dekatnya berdiri Tugu Kereta Api yang akrab dijuluki warga sebagai "Tugu Thomas".
16. **`ICN-16` | Tugu Tauco Cianjur**
    - **Pilar:** `HERITAGE` | **Tahun:** `2016/2017 (Revitalisasi 2023)` | **Jarak:** `1200 m` | **Alamat:** `Simpang Jl. Dr. Muwardi & Jl. HOS Cokroaminoto` | **Koordinat:** `[-6.814500, 107.143800]`
    - **Ringkasan Sejarah:** Menggantikan Tugu KB dan Tugu Bubur lama. Menampilkan empat replika botol tauco raksasa yang menumpahkan isinya sebagai penegas identitas Cianjur sebagai Kota Tauco.

---

## 4. Data 10 Kuliner Khas Sekitar Alun-Alun (`culinary_spots[]`)

1. **`CUL-01` | Bubur Ayam Sampurna (Bojongmeron)**
   - **Alamat:** `Jl. H. Agus Saleh No. 48, Bojongmeron, Kel. Solokpandan`
   - **Jarak:** `500 m` | **Koordinat:** `[-6.817800, 107.140500]`
   - **Harga:** `Rp8.000 - Rp29.500` (`min_price: 8000`)
   - **Jam Operasional:** Hari `[0,1,2,3,4,5,6]` (Setiap Hari), `06:00` – `21:30` WIB.
   - **Menu Andalan:** `["Bubur Ayam Spesial Ati Ampela", "Pepes Bawang Usus", "Karoket (Rp3.000)", "Telur Kampung Mentah", "Sop Duren"]`.
   - **Catatan Sejarah:** Melegenda sejak **1975**, dimasak dari beras Pandanwangi Cianjur menjadi bubur kental gurih **tanpa kuah kuning** dengan pelengkap pepes bawang usus dan karoket.

2. **`CUL-02` | Geco Nusasari Pak Iding**
   - **Alamat:** `Jl. Siti Jenab No. 24, Pamoyanan (Dekat Alun-Alun / Pasar Pelita)`
   - **Jarak:** `150 m` | **Koordinat:** `[-6.821950, 107.139100]`
   - **Harga:** `Mulai Rp10.000` (`min_price: 10000`)
   - **Jam Operasional:** Hari `[0,1,2,3,4,5,6]` (Setiap Hari), `08:30` – `16:00` WIB.
   - **Menu Andalan:** `["Geco (Tauge & Tauco) Ketupat", "Mie Aci Kuah Tauco", "Tahu & Kentang Bumbu Tauco"]`.
   - **Catatan Sejarah:** **Geco** adalah singkatan dari *Tauge dan Tauco*—kuliner otentik Cianjur bercita rasa gurih, manis, dan asam segar yang paling dekat dari sisi selatan Alun-Alun.

3. **`CUL-03` | Sate Maranggi Warujajar Ma' Nunung**
   - **Alamat:** `Jl. K.H. Hasyim Asy'ari No. 13, Warujajar, Kel. Solokpandan`
   - **Jarak:** `450 m` | **Koordinat:** `[-6.821800, 107.143200]`
   - **Harga:** `Mulai Rp3.000 / tusuk` (`min_price: 15000`)
   - **Jam Operasional:** Hari `[0,1,2,3,4,5,6]` (Setiap Hari), `06:30` – `22:30` WIB.
   - **Menu Andalan:** `["Sate Maranggi Full Daging Sapi", "Sate Maranggi Campur Lemak", "Nasi Uduk Hangat", "Ketan"]`.
   - **Catatan Sejarah:** Terhubung langsung dari koridor timur Jl. Suroso, warung legendaris ini menjual hingga **3.000 tusuk setiap hari** dan disantap bersama nasi uduk.

4. **`CUL-04` | Toko Roti Tan Keng Cu (1926)**
   - **Alamat:** `Jl. HOS Cokroaminoto No. 95, Kel. Muka`
   - **Jarak:** `850 m` | **Koordinat:** `[-6.817200, 107.143100]`
   - **Harga:** `Mulai Rp10.000` (`min_price: 10000`)
   - **Jam Operasional:** Hari `[0,2,3,4,5,6]` (**TUTUP HARI SENIN** / `day: 1` tutup), `09:30` – `20:30` WIB (Disarankan datang sebelum pukul 13.00 siang sebelum habis).
   - **Menu Andalan:** `["Roti Manis Klasik", "Roti Tawar Kuno", "Roti Susu Dingin"]`.
   - **Catatan Sejarah:** Berdiri sejak **1926** dan dahulu menjadi pemasok roti bagi tentara kolonial Belanda se-Jawa Barat; dapat dicapai dengan berjalan kaki melalui gang dari Bumi Ageung Cikidang.

5. **`CUL-05` | Pusat Oleh-Oleh Tauco Cap Meong (Ny. Tasma) & Kedai Geco Cap Meong**
   - **Alamat:** `Jl. HOS Cokroaminoto No. 160, Kel. Solokpandan`
   - **Jarak:** `1050 m` | **Koordinat:** `[-6.815800, 107.143500]`
   - **Harga:** `Rp15.400 - Rp50.000 (Tauco Botol Rp22.000)` (`min_price: 15400`)
   - **Jam Operasional:** Hari `[0,1,2,3,4,5,6]` (Setiap Hari), `07:30` – `20:00` WIB.
   - **Menu Andalan:** `["Tauco Botol Cap Meong 330ml (Rp22.000)", "Geco Banjur (Rp25.000)", "Bala-bala Bumbu Kacang (Rp19.000)", "Minuman Sari Pala & Sari Markisa (Rp17.600)"]`.
   - **Catatan Sejarah:** Berdiri sejak **1880** oleh pasangan **Tan Kei Hian (Babah Tasma)** dan **Tjoa Kim Nio (Ny. Tasma)**, kini dikelola generasi ke-5. Nama **"Cap Meong"** (Macan) digunakan sekitar 1935 setelah ditemukan tapak kaki macan di dapur pengolahan yang diyakini sebagai peliharaan Eyang Suryakencana. Kedelai difermentasi 4 bulan dalam guci berusia seabad dan dimasak kayu bakar.

6. **`CUL-06` | Dwigie Tauco Cookies**
   - **Alamat:** `Jl. Mangunsarkoro Gg. Melati No. 1, Kel. Pamoyanan`
   - **Jarak:** `420 m` | **Koordinat:** `[-6.818500, 107.139400]`
   - **Harga:** `Mulai Rp20.000` (`min_price: 20000`)
   - **Jam Operasional:** Hari `[0,1,2,3,4,5,6]`, `08:00` – `20:00` WIB.
   - **Menu Andalan:** `["Kue Kering Tauco Manis-Gurih", "Cookies Oleh-Oleh Khas Cianjur"]`.
   - **Catatan Sejarah:** Inovasi oleh-oleh modern yang mengolah tauco legendaris Cianjur menjadi kue kering renyah di koridor Jalan Mangunsarkoro.

7. **`CUL-07` | Rogan Soup (Roti Degan)**
   - **Alamat:** `Jl. Selamet No. 27, Cianjur`
   - **Jarak:** `350 m` | **Koordinat:** `[-6.822900, 107.141500]`
   - **Harga:** `Mulai Rp12.000` (`min_price: 12000`)
   - **Jam Operasional:** Hari `[0,1,2,3,4,5,6]`, `08:00` – `21:00` WIB.
   - **Menu Andalan:** `["Rogan (Sup Roti, Degan/Kelapa Muda, Kacang Hijau, Kolang-Kaling & Susu Dibakar Daun Pisang)"]`.
   - **Catatan Sejarah:** Kudapan hangat manis khas Cianjur berbungkus daun pisang yang sangat cocok dinikmati sore atau malam hari di dekat kawasan Bojongherang.

8. **`CUL-08` | Laksa Kang Aam**
   - **Alamat:** `Jl. Siliwangi No. 47A, Kel. Sawah Gede`
   - **Jarak:** `950 m` | **Koordinat:** `[-6.824500, 107.136500]`
   - **Harga:** `Mulai Rp12.000` (`min_price: 12000`)
   - **Jam Operasional:** Hari `[1,2,3,4,5,6]` (Senin–Sabtu, Minggu Tutup), `09:00` – `14:00` WIB.
   - **Menu Andalan:** `["Laksa Cianjur Kuah Kuning Santan", "Bihun, Tauge, Kemangi, Oncom & Telur Rebus"]`.
   - **Catatan Sejarah:** Sajian laksa khas Sunda Cianjur dengan aroma kemangi dan oncom yang kuat untuk makan siang.

9. **`CUL-09` | Bubur Ayam Mang Ade Suge**
   - **Alamat:** `Jl. Taifur Yusuf, Kel. Pamoyanan`
   - **Jarak:** `380 m` | **Koordinat:** `[-6.822200, 107.138200]`
   - **Harga:** `Mulai Rp6.000` (`min_price: 6000`)
   - **Jam Operasional:** Hari `[0,1,2,3,4,5,6]`, `06:00` – `22:00` WIB.
   - **Menu Andalan:** `["Bubur Ayam Cianjur Ekonomis", "Sate Usus & Ati"]`.
   - **Catatan Sejarah:** Salah satu alternatif bubur ayam khas Cianjur paling terjangkau yang berada di Kelurahan Pamoyanan dekat pusat kota.

10. **`CUL-10` | Bubur Ayam Lestari (24 Jam)**
    - **Alamat:** `Jl. Dr. Muwardi No. 133, Cianjur`
    - **Jarak:** `1100 m` | **Koordinat:** `[-6.816200, 107.145200]`
    - **Harga:** `Rp6.500 - Rp9.000` (`min_price: 6500`)
    - **Jam Operasional:** Hari `[0,1,2,3,4,5,6]`, `00:00` – `23:59` WIB (**Buka 24 Jam**).
    - **Menu Andalan:** `["Bubur Ayam 24 Jam", "Topping Risoles & Kerupuk"]`.
    - **Catatan Sejarah:** Pilihan utama kuliner malam dan dini hari bagi wisatawan yang tiba di Cianjur di luar jam makan normal.

---

## 5. Data 12 Hotel & Penginapan Sekitar Alun-Alun (`hotels[]`)

1. **`HTL-01` | Alamii Kaoem Guest House**
   - **Alamat:** `Kawasan Kaum, Pusat Kota Cianjur (Dekat Masjid Agung)` | **Jarak:** `172 m` | **Koordinat:** `[-6.820800, 107.138600]`
   - **Rating:** `8.6` | **Harga Mulai:** `Rp183.707` (`183707`)
   - **Fasilitas:** `["Jalan Kaki ke Alun-Alun", "WiFi", "AC", "Fasilitas Bisnis"]`.
2. **`HTL-02` | Shine BnB**
   - **Alamat:** `Jl. Selamat No. 60, Kel. Bojongherang, Kec. Cianjur` | **Jarak:** `290 m` | **Koordinat:** `[-6.822600, 107.141800]`
   - **Rating:** `8.4` (2.200+ ulasan) | **Harga Mulai:** `Rp242.000` (`242000`)
   - **Fasilitas:** `["Kafe & Restoran", "WiFi Gratis", "Parkir Mobil", "Jalan Kaki ke Alun-Alun"]`.
3. **`HTL-03` | Cordela Suites Cianjur**
   - **Alamat:** `Jl. Yulius Usman No. 28, Kel. Sayang, Kec. Cianjur` | **Jarak:** `502 m` | **Koordinat:** `[-6.821500, 107.145500]`
   - **Rating:** `9.3` | **Harga Mulai:** `Rp495.000` (`495000`)
   - **Fasilitas:** `["Kolam Renang Outdoor", "Restoran Mr. Ebood", "Dekat Stasiun (59m)", "Lift", "Resepsionis 24 Jam"]`.
4. **`HTL-04` | OYO 94802 Hotel Prima**
   - **Alamat:** `Pusat Kota Cianjur` | **Jarak:** `676 m` | **Koordinat:** `[-6.824200, 107.142500]`
   - **Rating:** `8.1` | **Harga Mulai:** `Rp108.000` (`108000`)
   - **Fasilitas:** `["Ultra-Budget", "TV", "Resepsionis", "Opsi Suite Keluarga"]`.
5. **`HTL-05` | Bydiel Hotel**
   - **Alamat:** `Jl. Ir. H. Juanda No. 70A, Kel. Mekarsari, Kec. Cianjur` | **Jarak:** `800 m` | **Koordinat:** `[-6.816500, 107.136200]`
   - **Rating:** `8.0` (562 ulasan) | **Harga Mulai:** `Rp153.000` (`153000`)
   - **Fasilitas:** `["Restoran", "Layanan Kamar", "Dapur & Kulkas (Tipe Tertentu)"]`.
6. **`HTL-06` | Mulyadi Suites Cianjur**
   - **Alamat:** `Pusat Kota Cianjur` | **Jarak:** `910 m` | **Koordinat:** `[-6.815200, 107.138500]`
   - **Rating:** `9.0` (93 ulasan) | **Harga Mulai:** `Rp393.280` (`393280`)
   - **Fasilitas:** `["Premium Suites", "Kebersihan Tinggi", "AC", "WiFi"]`.
7. **`HTL-07` | Green Costel**
   - **Alamat:** `Jl. Dr. Muwardi Bypass No. 124, Bojongherang` | **Jarak:** `1000 m` | **Koordinat:** `[-6.817500, 107.146800]`
   - **Rating:** `8.4` (320 ulasan) | **Harga Mulai:** `Rp274.000` (`274000`)
   - **Fasilitas:** `["Parkir Luas Bypass", "Restoran", "WiFi Gratis", "AC"]`.
8. **`HTL-08` | Super OYO 1898 Louise Place**
   - **Alamat:** `Pusat Kota Cianjur` | **Jarak:** `1120 m` | **Koordinat:** `[-6.814800, 107.142200]`
   - **Rating:** `8.0` (242 ulasan) | **Harga Mulai:** `Rp165.000` (`165000`)
   - **Fasilitas:** `["Check-out Ekspres", "Parkir Mobil", "Dekat Sentra Kuliner"]`.
9. **`HTL-09` | Hotel Gino Feruci Cianjur (Bintang 4)**
   - **Alamat:** `Jl. K.H. Abdullah Bin Nuh No. 46, Kel. Pamoyanan` | **Jarak:** `1180 m` | **Koordinat:** `[-6.824800, 107.131800]`
   - **Rating:** `9.1` (1.390 ulasan) | **Harga Mulai:** `Rp493.000` (`493000`)
   - **Fasilitas:** `["Hotel Bintang 4", "Kolam Renang Dewasa & Anak", "Gym & Spa", "Ballroom", "Restoran"]`.
10. **`HTL-10` | TW Penginapan Syariah (TW 2)**
    - **Alamat:** `Jl. Gunung Gede No. 22, Kel. Sawah Gede` | **Jarak:** `1450 m` | **Koordinat:** `[-6.826500, 107.134500]`
    - **Rating:** `7.8` (104 ulasan) | **Harga Mulai:** `Rp128.000` (`128000`)
    - **Fasilitas:** `["Syariah", "WiFi Gratis", "Parkir Gratis", "Resepsionis 24 Jam"]`.
11. **`HTL-11` | TW Hotel & Humbly Hotel**
    - **Alamat:** `Jl. K.H. Abdullah Bin Nuh No. 8, Rancagoong` | **Jarak:** `2850 m` | **Koordinat:** `[-6.832500, 107.128500]`
    - **Rating:** `8.6` | **Harga Mulai:** `Rp190.000` (`190000`)
    - **Fasilitas:** `["Restoran", "Sewa Mobil", "Layanan Pijat", "Parkir Luas"]`.
12. **`HTL-12` | Miracle Hotel Cianjur**
    - **Alamat:** `Pusat Kota Cianjur` | **Jarak:** `3170 m` | **Koordinat:** `[-6.835000, 107.127000]`
    - **Rating:** `8.8` (53 ulasan) | **Harga Mulai:** `Rp298.041` (`298041`)
    - **Fasilitas:** `["Kolam Renang", "Ramah Disabilitas", "Fasilitas Bisnis"]`.

---

## 6. Klaster Sebaran Tong Sampah (`trash_bins[]`)
Gunakan 8 titik awal yang tersebar pada 6 zona klaster strategis Alun-Alun Cianjur ini sebagai data *default* (yang dapat diperbarui akurasinya melalui `/admin-mapper`):
1. `BIN-SRS-01` | **Klaster Gerbang Jalan Suroso** | `[-6.821080, 107.140600]` | Tipe: `ORGANIK_ANORGANIK` | Hint: `"Di sisi dalam Gerbang Utama Jalan Suroso sebelah kanan jalur masuk"`.
2. `BIN-ASH-01` | **Klaster Koridor Asmaul Husna (Utara)** | `[-6.820850, 107.139820]` | Tipe: `ORGANIK_ANORGANIK` | Hint: `"Di ujung utara Lorong 99 Tiang Asmaul Husna dekat selasar Masjid Agung"`.
3. `BIN-ASH-02` | **Klaster Koridor Asmaul Husna (Selatan)** | `[-6.821350, 107.139820]` | Tipe: `ORGANIK_ANORGANIK` | Hint: `"Di ujung selatan Lorong 99 Tiang Asmaul Husna arah Gerbang Selatan"`.
4. `BIN-QRN-01` | **Klaster Perimeter Rumput Sintetis & Kolam Al-Qur'an** | `[-6.821000, 107.140200]` | Tipe: `ORGANIK_ANORGANIK` | Hint: `"Di tepi jalur pedestrian timur lapangan rumput sintetis dekat Kolam Perahu Al-Qur'an"`.
5. `BIN-QRN-02` | **Klaster Perimeter Rumput Sintetis (Barat)** | `[-6.821220, 107.139980]` | Tipe: `UMUM` | Hint: `"Di tepi barat jalur jogging track dekat bangku taman keluarga"`.
6. `BIN-KOL-01` | **Klaster Tribun Koloseum & Menara Pandang** | `[-6.821320, 107.140380]` | Tipe: `ORGANIK_ANORGANIK` | Hint: `"Di antara tangga masuk Tribun Koloseum dan kaki Menara Pandang putih"`.
7. `BIN-SLG-01` | **Klaster Panggung Suling, Lumbung Padi & Taman Anak** | `[-6.820720, 107.140150]` | Tipe: `ORGANIK_ANORGANIK` | Hint: `"Di dekat deretan Lumbung Padi dan area taman bermain anak sisi utara"`.
8. `BIN-STJ-01` | **Klaster Perimeter Trotoar Jalan Siti Jenab** | `[-6.821600, 107.140050]` | Tipe: `ORGANIK_ANORGANIK` | Hint: `"Di sepanjang trotoar luar Jalan Siti Jenab dekat Gerbang Selatan (jalur angkut truk kebersihan DLH)"`.

---

## 7. Spesifikasi 5 Misi Interaktif & Kunci Jawaban (`missions[]`)

1. **`MSN-01` | Jejak Santri: Rahasia Wakaf 1810**
   - **Pilar:** `Ngaos` | **XP:** `100` | **Badge:** `Penjaga Pilar Ngaos` | **Tipe:** `QUIZ`
   - **Pertanyaan:** `"Siapakah nama putri Bupati Cianjur ke-4 (Kangjeng Dalem Sabiruddin) yang mewakafkan tanah Masjid Agung Cianjur pada tahun 1810?"`
   - **Kunci Jawaban Valid (Case-Insensitive Contains):** `"siti bodedar"` (menerima `"Nyi Raden Siti Bodedar"`, `"Siti Bodedar"`).
2. **`MSN-02` | Harmoni Nada & Lonceng Kolonial**
   - **Pilar:** `Mamaos` | **XP:** `150` | **Badge:** `Maestro Mamaos & Sejarah` | **Tipe:** `QUIZ`
   - **Pertanyaan:** `"Seberangi Jalan Siti Jenab menuju gerbang utara Pendopo Kabupaten. Berapakah 4 digit angka tahun pembuatan yang terukir pada Lonceng Batavia di sana?"`
   - **Kunci Jawaban Valid:** `"1774"`.
3. **`MSN-03` | Ksatria K5: Operasi Bersih Alun-Alun**
   - **Pilar:** `Maenpo & Budaya K5` | **XP:** `200` | **Badge:** `Pahlawan Kebersihan K5` | **Tipe:** `GPS_TRASH_CHECKIN`
   - **Instruksi:** `"Gunakan fitur Peta untuk menuju salah satu titik Tong Sampah di Alun-Alun, buang sampahmu pada tempatnya untuk menjaga Budaya K5, lalu klik tombol Verifikasi Lokasi di bawah ini!"`.
4. **`MSN-04` | Legenda Kota Tauco 1880**
   - **Pilar:** `Kuliner Warisan` | **XP:** `100` | **Badge:** `Duta Kuliner Pandanwangi` | **Tipe:** `QUIZ`
   - **Pertanyaan:** `"Berdasarkan sejarah kuliner Cianjur tahun 1880, tapak kaki hewan apakah yang ditemukan di dapur Nyonya Tasma sehingga melahirkan merek Tauco tertua di Cianjur?"`
   - **Kunci Jawaban Valid (Contains):** `"meong"` atau `"macan"` atau `"harimau"`.
5. **`MSN-05` | Jejak Pejuang Kemerdekaan di Cikidang**
   - **Pilar:** `Sejarah Perjuangan` | **XP:** `150` | **Badge:** `Sejarawan Tatar Cianjur` | **Tipe:** `QUIZ`
   - **Pertanyaan:** `"Di rumah cagar budaya Bumi Ageung Cikidang (1886), organisasi militer bela tanah air apakah yang dibentuk oleh Gatot Mangkoepradja pada tahun 1943–1945?"`
   - **Kunci Jawaban Valid (Contains):** `"peta"` atau `"pembela tanah air"`.