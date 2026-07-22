# WarungXit Web

Frontend Vite React untuk user yang order tanpa Telegram.

## Local

```bash
npm install
npm run dev
```

Copy `.env.example` ke `.env`, lalu isi:

```env
VITE_API_BASE_URL=https://domain-backend-bot-kamu.com
VITE_TURNSTILE_SITE_KEY=site-key-cloudflare-turnstile
```

Kalau API belum tersedia, UI memakai fallback sample agar layout tetap bisa dicek.

## Vercel

Import repo GitHub, lalu set:

```text
Root Directory: web
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Environment Variable:

```text
VITE_API_BASE_URL=https://domain-backend-bot-kamu.com
VITE_TURNSTILE_SITE_KEY=site-key-cloudflare-turnstile
```

## API Yang Diharapkan

Detail lengkap endpoint antara web dan backend bot ada di [API_CONTRACT.md](./API_CONTRACT.md).

```text
GET  /api/web/products
POST /api/web/checkout
GET  /api/web/orders/:reference
GET  /api/web/orders/:reference/qris.png
POST /api/web/auth/request-code
POST /api/web/auth/register/verify
POST /api/web/auth/login
POST /api/web/auth/reset-password
```

Auth web disiapkan untuk repeat buyer:

- Register request code: `{ "purpose": "register", "name": "...", "email": "..." }`
- Register verify: `{ "name": "...", "email": "...", "password": "...", "code": "123456" }`
- Login: `{ "email": "...", "password": "..." }`
- Reset password request code: `{ "purpose": "reset_password", "email": "..." }`
- Reset password: `{ "email": "...", "code": "123456", "password": "..." }`

Kalau API belum tersedia, UI memakai demo localStorage dengan kode verifikasi `123456`.

Checkout web mengirim payload seperti:

```json
{
  "product_code": "gpt",
  "product_id": 1,
  "variant_name": "1 BULAN PRIVATE",
  "qty": 2,
  "buyer_name": "buyer@email.com",
  "email": "buyer@email.com",
  "whatsapp": "0812xxxx",
  "contact": "0812xxxx",
  "total_amount": 44000,
  "source": "web",
  "save_history": true,
  "account_id": "WEB-buyer@email.com",
  "turnstile_token": "token-dari-cloudflare",
  "verification_provider": "cloudflare_turnstile"
}
```

Email checkout dipakai sebagai akun ringan repeat buyer. Nanti kalau user daftar pakai email yang sama, riwayat paid dari email/account itu bisa ditampilkan.

Cloudflare Turnstile:

- Frontend memakai `VITE_TURNSTILE_SITE_KEY` untuk render widget.
- Backend bot harus menyimpan `TURNSTILE_SECRET_KEY`, lalu validasi `turnstile_token` sebelum transaksi dibuat.
- Kalau `VITE_TURNSTILE_SITE_KEY` kosong, UI memakai demo verification agar layout tetap bisa dites lokal.
