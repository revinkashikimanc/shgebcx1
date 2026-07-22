# Web API Contract

Contract ini jadi pegangan antara frontend `web/` dan backend bot auto order. Tujuannya: frontend bisa tetap rapi, sementara backend bot bisa disambung bertahap tanpa bongkar alur UI lagi.

## Base URL

Frontend membaca alamat backend dari:

```env
VITE_API_BASE_URL=https://backend-bot-kamu.com
```

Semua response JSON memakai bentuk dasar:

```json
{
  "ok": true
}
```

Jika gagal:

```json
{
  "ok": false,
  "code": "ERROR_CODE",
  "message": "Pesan error untuk user",
  "details": {}
}
```

## Money Fields

Untuk menghindari bentrok pembayaran dengan nominal sama, backend boleh menambah kode unik.

```json
{
  "amount": 14000,
  "unique_code": 1,
  "total_amount": 14001,
  "currency": "IDR"
}
```

- `amount`: subtotal asli produk sebelum kode unik.
- `unique_code`: tambahan nominal unik, bisa `0`.
- `total_amount`: nominal final yang tampil di QRIS dan dicocokkan gateway.
- Frontend wajib menampilkan subtotal, kode unik, dan total jika `unique_code > 0`.

## Status

Status order yang dipakai web:

- `pending`: menunggu pembayaran.
- `paid`: pembayaran terdeteksi, order masuk proses.
- `completed`: order selesai dan detail akun bisa dilihat.
- `expired`: QRIS kadaluarsa.
- `canceled`: order dibatalkan.

Timestamp memakai Unix milliseconds:

- `created_at`
- `expires_at`
- `paid_at`
- `completed_at`

## Products

### GET /api/web/products

Mengambil katalog produk dari database bot.

Response:

```json
{
  "ok": true,
  "products": [
    {
      "id": 1,
      "code": "chatgpt-plus",
      "name": "ChatGPT Plus 1 Bulan",
      "desc": "Akun premium siap pakai dengan garansi sesuai ketentuan toko.",
      "category": "AI TOOLS",
      "image_url": "https://catbox.moe/produk.jpg",
      "icon_url": "https://catbox.moe/icon.png",
      "sold": 56,
      "variants": [
        {
          "name": "1 BULAN PRIVATE",
          "price": 22000,
          "stock": 44
        }
      ]
    }
  ],
  "meta": {
    "updated_at": 1784650000000
  }
}
```

Catatan:

- `category` optional. Kalau kosong, frontend boleh nebak dari `name` atau `code`.
- `icon_url` optional. Nanti bisa diisi dari fitur Manage Web.
- `image_url` optional. Kalau produk punya gambar Catbox, frontend boleh pakai sebagai visual produk.

## Checkout

### POST /api/web/checkout

Membuat order baru dan QRIS pembayaran.

Request:

```json
{
  "product_id": 2,
  "product_code": "claude-max",
  "variant_name": "MAX 20X",
  "qty": 1,
  "buyer_name": "Revin",
  "email": "buyer@example.com",
  "whatsapp": "0812xxxxxxx",
  "source": "web",
  "save_history": true,
  "turnstile_token": "token-from-cloudflare"
}
```

Response:

```json
{
  "ok": true,
  "order": {
    "id": 12,
    "reference_id": "WX-20260722-ABC123",
    "status": "pending",
    "method": "qris",
    "amount": 400000,
    "unique_code": 1,
    "total_amount": 400001,
    "currency": "IDR",
    "product": {
      "id": 2,
      "code": "claude-max",
      "name": "Claude Max 20x 1 Minggu"
    },
    "variant": {
      "name": "MAX 20X",
      "price": 400000
    },
    "qty": 1,
    "email": "buyer@example.com",
    "created_at": 1784650000000,
    "expires_at": 1784650300000,
    "qris_image_url": "https://backend-bot-kamu.com/api/web/orders/WX-20260722-ABC123/qris.png"
  }
}
```

Possible errors:

```json
{
  "ok": false,
  "code": "EMAIL_REQUIRES_LOGIN",
  "message": "Email ini sudah punya akun. Silakan masuk atau gunakan email lain."
}
```

Kode error checkout:

- `INVALID_EMAIL`: format email salah.
- `OUT_OF_STOCK`: stok varian tidak cukup.
- `EMAIL_REQUIRES_LOGIN`: email sudah punya akun/password dan user belum login.
- `EMAIL_NEEDS_PASSWORD_SETUP`: email sudah pernah checkout guest, belum punya password, dan user belum login.
- `TURNSTILE_FAILED`: verifikasi bot gagal.
- `CHECKOUT_FAILED`: error umum.

## Payment

### GET /api/web/orders/:reference

Mengambil status order terbaru.

Response:

```json
{
  "ok": true,
  "order": {
    "reference_id": "WX-20260722-ABC123",
    "status": "pending",
    "method": "qris",
    "amount": 400000,
    "unique_code": 1,
    "total_amount": 400001,
    "currency": "IDR",
    "product": {
      "name": "Claude Max 20x 1 Minggu"
    },
    "variant": {
      "name": "MAX 20X"
    },
    "qty": 1,
    "email": "buyer@example.com",
    "created_at": 1784650000000,
    "expires_at": 1784650300000
  }
}
```

### GET /api/web/orders/:reference/qris.png

Mengambil gambar QRIS. Backend boleh mengembalikan QRIS polos atau QRIS frame sesuai konfigurasi bot.

Response:

- `200 image/png` jika order masih pending.
- `410 Gone` jika order expired.
- `404 Not Found` jika reference tidak ada.

### POST /api/web/orders/:reference/refresh

Optional. Dipakai jika frontend ingin tombol "Perbarui status" memanggil endpoint khusus. Kalau tidak dibuat, frontend cukup pakai `GET /api/web/orders/:reference`.

Response sama seperti `GET /api/web/orders/:reference`.

## Orders

### GET /api/web/me/orders

Mengambil list pesanan user login. Endpoint ini wajib pakai auth token.

Header:

```http
Authorization: Bearer <token>
```

Response:

```json
{
  "ok": true,
  "orders": [
    {
      "reference_id": "WX-20260722-ABC123",
      "status": "completed",
      "product_name": "ChatGPT Plus 1 Bulan",
      "variant_name": "1 BULAN PRIVATE",
      "qty": 1,
      "amount": 14000,
      "unique_code": 1,
      "total_amount": 14001,
      "created_at": 1784650000000,
      "completed_at": 1784650500000
    }
  ]
}
```

Catatan keamanan:

- Jangan buat endpoint public `GET /orders?email=...` yang langsung menampilkan riwayat.
- Kalau ingin lookup via email tanpa login, wajib lewat vercode email dulu.

### GET /api/web/orders/:reference/detail

Mengambil detail order selesai, termasuk credential akun. Endpoint ini hanya boleh untuk pemilik order.

Header:

```http
Authorization: Bearer <token>
```

Response:

```json
{
  "ok": true,
  "order": {
    "reference_id": "WX-20260722-ABC123",
    "status": "completed",
    "product_name": "ChatGPT Plus 1 Bulan",
    "variant_name": "1 BULAN PRIVATE",
    "qty": 1,
    "total_amount": 14001
  },
  "credential": {
    "username": "akun@example.com",
    "password": "secret-password",
    "note": "Gunakan sesuai ketentuan toko."
  }
}
```

Possible errors:

- `ORDER_NOT_FOUND`
- `ORDER_NOT_COMPLETED`
- `UNAUTHORIZED`
- `FORBIDDEN`

## Auth

### POST /api/web/auth/request-code

Mengirim kode verifikasi email.

Request:

```json
{
  "email": "buyer@example.com",
  "purpose": "register"
}
```

Purpose yang dipakai:

- `register`
- `forgot_password`
- `checkout_password_setup`

Response:

```json
{
  "ok": true,
  "expires_in": 300
}
```

### POST /api/web/auth/register/verify

Daftar akun baru dengan vercode.

Request:

```json
{
  "name": "Revin",
  "email": "buyer@example.com",
  "password": "password-baru",
  "code": "123456",
  "whatsapp": "0812xxxxxxx"
}
```

Response:

```json
{
  "ok": true,
  "token": "jwt-or-session-token",
  "user": {
    "id": "web_user_123",
    "name": "Revin",
    "email": "buyer@example.com",
    "whatsapp": "0812xxxxxxx",
    "has_password": true
  }
}
```

### POST /api/web/auth/login

Login akun web.

Request:

```json
{
  "email": "buyer@example.com",
  "password": "password"
}
```

Response:

```json
{
  "ok": true,
  "token": "jwt-or-session-token",
  "user": {
    "id": "web_user_123",
    "name": "Revin",
    "email": "buyer@example.com",
    "whatsapp": "0812xxxxxxx",
    "has_password": true
  }
}
```

### POST /api/web/auth/reset-password

Reset password dari lupa password. Wajib vercode.

Request:

```json
{
  "email": "buyer@example.com",
  "code": "123456",
  "password": "password-baru"
}
```

Response:

```json
{
  "ok": true
}
```

### POST /api/web/auth/checkout-password

Dipakai ketika checkout pakai email guest lama yang belum punya password, lalu user memilih "Buat Password Sekarang". Flow ini wajib vercode karena user belum login.

Request:

```json
{
  "email": "buyer@example.com",
  "code": "123456",
  "password": "password-baru"
}
```

Response:

```json
{
  "ok": true,
  "token": "jwt-or-session-token",
  "user": {
    "id": "web_user_123",
    "name": "buyer",
    "email": "buyer@example.com",
    "has_password": true
  }
}
```

## Profile

### GET /api/web/me

Mengambil profil user login.

Header:

```http
Authorization: Bearer <token>
```

Response:

```json
{
  "ok": true,
  "user": {
    "id": "web_user_123",
    "name": "Revin",
    "email": "buyer@example.com",
    "whatsapp": "0812xxxxxxx",
    "has_password": false
  }
}
```

### PATCH /api/web/me

Update profil.

Request:

```json
{
  "name": "Revin",
  "whatsapp": "0812xxxxxxx"
}
```

Response:

```json
{
  "ok": true,
  "user": {
    "id": "web_user_123",
    "name": "Revin",
    "email": "buyer@example.com",
    "whatsapp": "0812xxxxxxx",
    "has_password": false
  }
}
```

### POST /api/web/me/password

Buat atau ganti password dari halaman Profile Saya. Ini tidak perlu vercode karena user sudah berada di sesi akunnya.

Request:

```json
{
  "password": "password-baru"
}
```

Response:

```json
{
  "ok": true,
  "user": {
    "id": "web_user_123",
    "email": "buyer@example.com",
    "has_password": true
  }
}
```

## Guest Account Rule

Flow checkout tanpa daftar:

1. User checkout pakai email baru.
2. Backend membuat akun guest otomatis dengan `has_password: false`.
3. Riwayat order tersimpan ke email itu.
4. Banner warning wajib muncul sampai user membuat password:

```text
Akun ini belum punya password.
Buat password agar riwayat pesanan bisa diakses kembali dari perangkat lain.
```

Jika email yang sama dipakai checkout lagi:

- Jika user belum login dan akun itu sudah ada, backend wajib block.
- Jika `has_password: false`, tampilkan opsi:
  - Masuk
  - Buat Password Sekarang
  - Gunakan Email Lain
- Jika `has_password: true`, tampilkan opsi:
  - Masuk
  - Gunakan Email Lain

## Payment Lifecycle

Frontend behavior:

1. `pending`
   - Tampilkan QRIS, countdown, instruksi bayar, dan tombol perbarui status.
2. `expired`
   - Hilangkan QRIS.
   - Tampilkan state pembayaran gagal, nominal, reference, dan tombol buat pesanan baru.
3. `paid` atau `completed`
   - Tampilkan pembayaran sukses.
   - Countdown redirect 3 detik ke Pesanan Saya atau detail order.
   - Tampilkan tombol Pesanan Saya.

## Security Rules

- Credential akun tidak boleh keluar di list produk, list order, atau status public.
- Credential hanya boleh keluar dari endpoint detail order yang sudah lolos auth/ownership.
- Lookup order by email tanpa login harus lewat vercode.
- Checkout wajib validasi email.
- Checkout produksi sebaiknya memakai Cloudflare Turnstile.
- Password disimpan hashed, jangan plaintext.

## Backend Mapping

Bagian bot yang kemungkinan dipakai:

- Produk: `data/products.json`
- Stok akun: `stok/*.json`
- Transaksi: `data/transactions.json`
- Gateway: `lib/payment-gateways.js`
- GoPay client: `lib/gopay/gopay.client.js`
- Validator transaksi: `lib/handler/transactions.js`
- QRIS frame: `utils/qrisFrame.js`
- Store config: `lib/storeConfig.js`

## Implementation Order

Urutan yang paling aman:

1. Bikin service API kecil di backend bot.
2. Implement `GET /api/web/products`.
3. Implement `POST /api/web/checkout`.
4. Implement `GET /api/web/orders/:reference`.
5. Implement QRIS image endpoint.
6. Implement auth dan guest account rule.
7. Implement order detail credential endpoint.
8. Baru lanjut Manage Web/Admin Dashboard.
