# Car Wash Management System
*Aplikasi Kasir & Laporan Keuangan Cuci Mobil*

Aplikasi manajemen kasir dan keuangan untuk bisnis cuci mobil/motor. Mencatat transaksi layanan, mengelola pricelist, memantau laporan laba/rugi (P/L), dan mencatat pengeluaran operasional dalam satu platform.

## Tech Stack

- **Backend:** Laravel 12 (PHP 8.2+)
- **Frontend:** React 19 + TypeScript + Inertia.js
- **Database:** MySQL / PostgreSQL
- **Styling:** Tailwind CSS 4
- **Auth:** Laravel Fortify
- **Export:** Laravel Excel / DomPDF (PDF & XLSX)

## Modules

| Module | Description |
|--------|-------------|
| M1 — Transaksi | Input transaksi layanan cuci kendaraan (kasir) |
| M2 — Pricelist | Manajemen harga layanan per jenis kendaraan |
| M3 — P/L Report | Laporan pendapatan & pengeluaran, dilindungi password |
| M4 — Pengeluaran | Pencatatan biaya operasional harian |
| M5 — Export | Unduh laporan P/L (PDF/XLSX) berdasarkan rentang tanggal |

## Getting Started

### Requirements

- PHP 8.2+
- Composer
- Node.js 20+
- MySQL or PostgreSQL

### Installation

```bash
git clone <repo-url>
cd carwash

composer install
npm install

cp .env.example .env
php artisan key:generate
```

Configure your database in `.env`, then:

```bash
php artisan migrate
php artisan db:seed
```

### Development

```bash
composer run dev        # Start all servers (PHP, queue, logs, Vite)
composer run dev:ssr    # Same with SSR enabled
```

## Commands

```bash
# Testing
composer run test
php artisan test --filter=TestName

# Linting & formatting
composer run lint
./vendor/bin/pint           # PHP only
npx eslint resources/       # JS/TS only
npx tsc --noEmit            # TypeScript check only

# Database
php artisan migrate
php artisan db:seed
```

## Key Concepts

### Transaction Flow (M1)

Transaksi memiliki dua status:

- **Draft** — belum masuk P/L, bisa diedit/dihapus bebas
- **Published** — masuk P/L sebagai pendapatan, immutable; hapus memerlukan password

Harga final = Harga Pricelist + ADJ Price (adjustment/diskon). Metode pembayaran: **Cash** atau **QRIS**.

### P/L Report (M3)

Laporan P/L dilindungi password (bcrypt). Hanya transaksi berstatus **Published** yang dihitung sebagai pendapatan. Sesi akses timeout setelah 30 menit tidak aktif.

### User Roles

| Role | Transaksi | Pricelist | P/L | Pengeluaran | Export |
|------|-----------|-----------|-----|-------------|--------|
| Kasir / Operator | Input & View | View Only | — | Input | — |
| Owner / Admin | Full | Full CRUD | ✓ (password) | Full | ✓ |

## Database Tables

| Table | Description |
|-------|-------------|
| `services` | Master data layanan & harga (soft-delete) |
| `transactions` | Transaksi kasir; status: `draft` \| `published` |
| `expenses` | Pengeluaran operasional harian |
| `settings` | Konfigurasi app termasuk hash password P/L |
