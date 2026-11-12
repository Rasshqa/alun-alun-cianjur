# Panduan Maintenance: Alun-Alun Cianjur PWA

## Deploy

```bash
npm run build        # kompilasi TypeScript + bundle produksi ke dist/
npx vercel --prod    # deploy ke Vercel production
```

## Update Data

Seluruh data aplikasi berada di `src/data/cianjur-data.json`.

### 1. Ubah Status Operasional Taman (`app_config`)

```json
"app_config": {
  "center_coords": [-6.82065, 107.14045],
  "default_zoom": 17,
  "park_status": "OPEN",
  "status_message": "Alun-Alun & Taman Alun-Alun Cianjur dibuka untuk umum (Akses masuk melalui Gerbang Utama Jalan Suroso)."
}
```

Ubah `"OPEN"` menjadi `"CLOSED"` dan sesuaikan `status_message` bila ada penutupan sementara.

### 2. Tambah / Ubah Kuliner (`culinary_spots`)

```json
{
  "id": "CUL-11",
  "name": "Nama Tempat Kuliner",
  "address": "Alamat lengkap di Cianjur",
  "distance_m": 250,
  "coords": [-6.821366, 107.142329],
  "price_range": "Rp10.000 - Rp25.000",
  "min_price": 10000,
  "open_days": [0, 1, 2, 3, 4, 5, 6],
  "open_time": "07:00",
  "close_time": "21:00",
  "signature_menu": ["Menu 1", "Menu 2"],
  "history_note": "Catatan sejarah atau keunikan kuliner."
}
```

### 3. Tambah / Ubah Hotel (`hotels`)

```json
{
  "id": "HTL-13",
  "name": "Nama Hotel",
  "address": "Alamat lengkap hotel",
  "distance_m": 450,
  "coords": [-6.824503, 107.142254],
  "rating": 8.8,
  "review_count": 120,
  "price_start_idr": 250000,
  "facilities": ["Jalan Kaki ke Alun-Alun", "WiFi", "AC"]
}
```

### 4. Kalibrasi Titik dengan Admin Mapper (`?mode=admin`)

Buka URL dengan query parameter `?mode=admin` untuk melihat koordinat kursor dan menyalin koordinat `[lat, lng]` secara langsung:

```text
http://localhost:5173/?mode=admin
https://alun-alun-cianjur.web.id/?mode=admin
```

### 5. File QR Code Fisik (`public/qr/`)

- `public/qr/gate-suroso.svg` -> `https://alun-alun-cianjur.web.id/?gate=suroso`
- `public/qr/gate-masjid-selatan.svg` -> `https://alun-alun-cianjur.web.id/?gate=masjid-selatan`
- `public/qr/gate-masjid-utara.svg` -> `https://alun-alun-cianjur.web.id/?gate=masjid-utara`
- `public/qr/default.svg` -> `https://alun-alun-cianjur.web.id/`
