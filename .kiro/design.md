# System Design & Architecture

## Tech Stack
- **Frontend**: HTML5, CSS3 (Custom Variables), Vanilla JavaScript.
- **Visualization**: Chart.js (CDN).
- **APIs**: BigDataCloud Reverse Geocoding API untuk fitur lokasi.

## Data Schema & Persistence
- **LocalStorage Keys**: 
    - `transactions`: Menyimpan array objek pengeluaran.
    - `categories`: Menyimpan daftar kategori kustom.
    - `theme`: Menyimpan status 'light' atau 'dark'.
- **Object Structure**: `{ id: timestamp, name: string, amount: number, category: string }`.

## UI Logic
- **Theming**: Menggunakan class `.light-mode` pada elemen `body` untuk menimpa CSS variables.
- **Chart Logic**: Fungsi `updateChart()` yang menghancurkan (destroy) instance lama sebelum membuat grafik baru untuk mencegah tumpang tindih data.
- **Summary Logic**: Menggunakan objek `monthTotals` untuk mengelompokkan data berdasarkan format `toLocaleDateString`.