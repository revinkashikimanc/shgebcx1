import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  BadgeCheck,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CheckCircle2,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  Moon,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Sun,
  Timer,
  LogIn,
  LogOut,
  Save,
  X,
  UserPlus,
  UserRound,
  Zap,
} from "lucide-react";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";
const WEB_CUSTOMER_KEY = "warungxit_customer";
const WEB_USERS_KEY = "warungxit_web_users";
const WEB_ORDER_HISTORY_KEY = "warungxit_order_history";
const WEB_DEMO_ORDERS_KEY = "warungxit_demo_orders";
const WEB_THEME_KEY = "warungxit_theme";
const WEB_LANG_KEY = "warungxit_lang";
const DEMO_VERIFICATION_CODE = "123456";
const DEMO_PAYMENT_EXPIRES_MS = 30 * 1000;
const ORDER_HISTORY_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const STATUS_ORDER_PAGE_SIZE = 5;
const DEFAULT_STORE_BRAND = "SphynixStore";
const STORE_AUTHOR = "SPHY >.<";
const STORE_ICON_URL = import.meta.env.VITE_STORE_ICON_URL || "/store-icon.svg";
const PAYMENT_EXPIRED_ICON_URL = import.meta.env.VITE_PAYMENT_EXPIRED_ICON_URL || "/payment-expired-icon.svg";
const demoBuyerNames = ["Qu...", "An...", "Ri...", "Ba...", "Di...", "Ka..."];
const buyerReviews = [
  { name: "Bayu M.", date: "17 Jul 2026, 11.40", text: "works and trusted" },
  { name: "na...", date: "4 Jul 2026, 17.08", text: "trusted min" },
  { name: "Ri...", date: "15 Jul 2026, 01.00", text: "trusted" },
  { name: "yu...", date: "8 Jul 2026, 15.16", text: "mntb" },
  { name: "Moki I.", date: "7 Jul 2026, 10.54", text: "manteb min" },
];

function BrandText({ brand = DEFAULT_STORE_BRAND, className = "", dot = false }) {
  const normalized = String(brand || DEFAULT_STORE_BRAND).trim().toUpperCase();
  const suffixMatch = normalized.match(/^(.+?)(STORE|SHOP|XIT)$/i);
  const wordSplit = normalized.match(/^(.+\s)([^\s]+)$/);
  const fallbackSplit = wordSplit
    ? [wordSplit[1], wordSplit[2]]
    : normalized.length > 3
      ? [normalized.slice(0, -3), normalized.slice(-3)]
    : [normalized, ""];
  const brandParts = suffixMatch
    ? [suffixMatch[1], suffixMatch[2]]
    : fallbackSplit;

  return (
    <span className={className}>
      {brandParts[1] ? (
        <>
          <span className="brand-text-main">{brandParts[0]}</span><span className="brand-text-accent">{brandParts[1]}</span>
        </>
      ) : normalized}
      {dot ? <span className="brand-text-dot">.</span> : null}
    </span>
  );
}

function BrandIcon() {
  const [failed, setFailed] = useState(false);

  return (
    <span className="brand-icon">
      {STORE_ICON_URL && !failed ? (
        <img src={STORE_ICON_URL} alt="" onError={() => setFailed(true)} />
      ) : (
        <Zap size={21} fill="currentColor" />
      )}
    </span>
  );
}

function PaymentExpiredIcon() {
  const [failed, setFailed] = useState(false);

  return (
    <div className="expired-mark">
      {PAYMENT_EXPIRED_ICON_URL && !failed ? (
        <img src={PAYMENT_EXPIRED_ICON_URL} alt="" onError={() => setFailed(true)} />
      ) : (
        <X size={38} />
      )}
    </div>
  );
}

function SiteHeader({
  copy = getText(),
  storeInfo = {},
  page = "home",
  theme = "light",
  language = "id",
  apiMode = "demo",
  account = null,
  activeAuth = "",
  hidden = false,
  onHome,
  onProducts,
  onHowto,
  onStatus,
  onProfile,
  onThemeToggle,
  onLanguageChange,
  onAuth,
  onOrders,
  onLogout,
}) {
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const accountName = getAccountDisplayName(account);
  const accountEmail = getAccountEmail(account);
  const storeBrand = getStoreDisplayName(storeInfo);

  useEffect(() => {
    if (!accountOpen) return undefined;

    const handlePointer = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) setAccountOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === "Escape") setAccountOpen(false);
    };

    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [accountOpen]);

  const runAccountAction = (action) => {
    setAccountOpen(false);
    action?.();
  };

  return (
    <header className={`neo-nav ${hidden ? "nav-hidden" : ""}`}>
      <button className="brand-lockup" type="button" onClick={onHome} aria-label={`${storeBrand} home`}>
        <BrandIcon />
        <BrandText brand={storeBrand} className="brand-name" />
      </button>
      <div className="nav-links">
        <button className={page === "home" ? "active" : ""} type="button" onClick={onHome}>{copy.home}</button>
        <button className={page === "products" ? "active" : ""} type="button" onClick={onProducts}>{copy.products}</button>
        <button className={page === "howto" ? "active" : ""} type="button" onClick={onHowto}>{copy.howto}</button>
        <button className={page === "status" ? "active" : ""} type="button" onClick={onStatus}>{copy.status}</button>
        {account ? (
          <button className={page === "profile" ? "active" : ""} type="button" onClick={onProfile}>{copy.profile}</button>
        ) : null}
      </div>
      <div className="nav-actions">
        <button className="theme-toggle" type="button" onClick={onThemeToggle} aria-label={theme === "dark" ? "Aktifkan light theme" : "Aktifkan dark theme"} title={theme === "dark" ? "Light theme" : "Dark theme"}>
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <div className="language-switch" aria-label="Pilih bahasa">
          <button className={language === "id" ? "active" : ""} type="button" onClick={() => onLanguageChange("id")}>ID</button>
          <button className={language === "en" ? "active" : ""} type="button" onClick={() => onLanguageChange("en")}>EN</button>
        </div>
        {account ? (
          <div className="account-menu-wrap" ref={accountMenuRef}>
            <button
              className={`account-chip ${accountOpen ? "active" : ""}`}
              type="button"
              onClick={() => setAccountOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={accountOpen}
            >
              <span className="account-avatar">{accountName.slice(0, 1).toUpperCase()}</span>
              <span className="account-chip-name">{accountName}</span>
              <span className="account-caret">{accountOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
            </button>
            {accountOpen ? (
              <div className="account-dropdown" role="menu">
                <div className="account-dropdown-head">
                  <span className="account-avatar large">{accountName.slice(0, 1).toUpperCase()}</span>
                  <div>
                    <strong>{accountName}</strong>
                    <span>{accountEmail}</span>
                  </div>
                </div>
                <button type="button" role="menuitem" onClick={() => runAccountAction(onProfile)}>
                  <UserRound size={17} /> {copy.profile}
                </button>
                <button type="button" role="menuitem" onClick={() => runAccountAction(onOrders)}>
                  <ShoppingBag size={17} /> {copy.myOrders}
                </button>
                <button className="danger" type="button" role="menuitem" onClick={() => runAccountAction(onLogout)}>
                  <LogOut size={17} /> {copy.logout}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <button className={`auth-button ${activeAuth === "register" ? "active" : ""}`} type="button" onClick={() => onAuth("register")}>
              <UserPlus size={16} /> {copy.register}
            </button>
            <button className={`auth-button alt ${activeAuth === "login" ? "active" : ""}`} type="button" onClick={() => onAuth("login")}>
              <LogIn size={16} /> {copy.login}
            </button>
          </>
        )}
      </div>
    </header>
  );
}

const UI_TEXT = {
  id: {
    home: "Beranda",
    products: "Produk",
    howto: "Cara Order",
    status: "Pesanan",
    register: "Daftar",
    login: "Masuk",
    logout: "Keluar",
    profile: "Profil Saya",
    myOrders: "Pesanan Saya",
    profileGreeting: "Halo",
    profileWelcome: "Selamat datang di dashboard kamu.",
    shopAgain: "Belanja Lagi",
    totalOrders: "Total Pesanan",
    completedOrders: "Selesai",
    totalSpent: "Total Belanja",
    profileFormTitle: "Profil Saya",
    whatsappHelp: "Untuk menerima notifikasi order lewat WhatsApp kalau fitur ini sudah tersambung.",
    saveProfile: "Simpan Profil",
    passwordFormTitle: "Buat Password",
    newPasswordRepeat: "Ulangi Password Baru",
    makePassword: "Buat Password",
    profileSaved: "Profil tersimpan.",
    passwordSaved: "Password berhasil diperbarui.",
    passwordTooShort: "Password minimal 6 karakter.",
    passwordMismatch: "Password baru belum sama.",
    passwordSetupTitle: "Buat Password Akun",
    passwordSetupDesc: "Akun kamu sudah dibuat otomatis dari checkout pertama. Verifikasi email dulu untuk membuat password.",
    passwordSetupWarning: "Akun ini belum punya password.\nBuat password agar riwayat pesanan bisa diakses kembali dari perangkat lain.",
    passwordSetupCta: "Buat Password Sekarang",
    passwordSetupSent: "Kode buat password sudah dikirim ke email.",
    passwordSetupDone: "Password akun berhasil dibuat.",
    emailAlreadyUsedTitle: "Email sudah pernah digunakan",
    emailAlreadyUsedDesc: "Demi keamanan, checkout dengan email yang sama harus login dulu atau buat password akun.",
    useAnotherEmail: "Gunakan Email Lain",
    emailRegisteredLogin: "Email ini sudah terdaftar. Silakan masuk untuk lanjut checkout.",
    emailNeedsPassword: "Email ini sudah pernah checkout. Buat password dulu atau masuk dengan akunmu.",
    all: "SEMUA",
    backCatalog: "Katalog Produk",
    backHome: "Beranda",
    checkout: "Checkout",
    checkoutFast: "Premium apps store",
    heroTitle: "Akses Premium Apps Tanpa Ribet",
    heroDesc: "Pilih produk, bayar QRIS, lalu cek status pesanan langsung dari web.",
    heroCta: "Lihat Produk",
    homeBadge: "Layanan Otomatis 24 Jam",
    homeAboutTitle: "Premium apps siap pakai, order cepat tanpa ribet.",
    homeAboutDesc: "Tempat beli akses premium apps favorit dengan harga ramah kantong, garansi toko, dan status pesanan yang bisa dipantau langsung. Cocok buat buyer yang mau praktis tanpa proses panjang.",
    homeFeatureFastTitle: "Harga termurah",
    homeFeatureFastDesc: "Pilihan premium apps dibuat tetap ramah kantong tanpa ngorbanin kualitas layanan.",
    homeFeatureWarrantyTitle: "Bergaransi",
    homeFeatureWarrantyDesc: "Setiap produk punya ketentuan garansi toko yang jelas kalau ada kendala setelah order.",
    homeFeatureStatusTitle: "Status order",
    homeFeatureStatusDesc: "Cek pembayaran, progres pesanan, dan riwayat order langsung dari halaman status.",
    homeTagSecure: "QRIS cepat",
    homeTagProtected: "Privasi pembeli",
    homeTagDelivery: "Akses siap pakai",
    homeTagSupport: "Bantuan aktif",
    statOrders: "Pesanan selesai",
    statProducts: "Produk premium",
    statService: "Layanan otomatis",
    premiumApps: "Premium Apps",
    topProducts: "Produk Terlaris",
    qrisReady: "Bayar QRIS",
    readyStock: "Bergaransi",
    stockRealtime: "Bergaransi",
    warranty: "Garansi toko",
    productMetaStock: "Stok tersedia",
    productMetaProcess: "Proses",
    productMetaPayment: "Bayar",
    productMetaProcessValue: "Otomatis",
    buyNow: "Beli Sekarang",
    outOfStock: "Stok Habis",
    productReady: "Produk digital siap order.",
    stock: "Stok",
    codeDemo: "Kode demo",
    resetCodeSent: "Kode reset sudah dikirim ke email.",
    passwordResetDone: "Password sudah direset. Silakan masuk.",
    verificationCodeSent: "Kode verifikasi sudah dikirim ke email.",
    catalogTitle: "Katalog Produk",
    searchProduct: "Cari produk...",
    loadingCatalog: "Memuat katalog",
    orderFlowTitle: "Alur belanja singkat",
    orderFlow1Title: "Pilih produk",
    orderFlow1Desc: "Cari produk digital yang kamu butuhkan, lalu pilih varian dan jumlah order.",
    orderFlow2Title: "Isi data pembeli",
    orderFlow2Desc: "Masukkan email aktif untuk identitas pesanan dan akses riwayat setelah pembayaran sukses.",
    orderFlow3Title: "Bayar QRIS",
    orderFlow3Desc: "Scan QRIS, tunggu validasi, lalu cek status pesanan dari halaman transaksi.",
    statusTitle: "Status & riwayat pesanan",
    statusDesc: "Cek transaksi dan riwayat pesanan dalam satu halaman akun.",
    statusOverviewPending: "Belum dibayar",
    statusOverviewCanceled: "Batal / expired",
    statusOverviewDone: "Order selesai",
    statusSearchNote: "Masukkan kode transaksi untuk cek status order spesifik.",
    txCode: "Kode Transaksi",
    txPlaceholder: "contoh: WX-12345",
    checkStatus: "Cek Status",
    txRequired: "Masukkan kode transaksi dulu.",
    txNotFound: "Transaksi tidak ditemukan.",
    txFoundPending: "Transaksi ditemukan dan masih menunggu pembayaran.",
    txFoundExpired: "Transaksi ditemukan, tapi pembayaran sudah kedaluwarsa.",
    txFoundDone: "Transaksi ditemukan. Detail pesanan dibuka.",
    pending: "Menunggu Pembayaran",
    canceled: "Dibatalkan",
    expired: "Kedaluwarsa",
    done: "Selesai",
    pendingEmpty: "Belum ada pesanan yang sedang menunggu pembayaran.",
    canceledEmpty: "Belum ada pesanan yang dibatalkan atau kedaluwarsa.",
    doneEmpty: "Belum ada pesanan selesai.",
    credentialSafe: "Credential tidak ditampilkan di halaman status. Detail sensitif hanya muncul lewat flow reveal yang tervalidasi.",
    dataWillShow: "Data akan tampil otomatis setelah backend status order tersambung.",
    viewAccountDetail: "Lihat Detail Akun",
    payNow: "Bayar Sekarang",
    viewSummary: "Lihat Ringkasan",
    orderSummaryTitle: "Ringkasan Pesanan",
    orderSummaryDesc: "Detail produk dan reference pembayaran untuk pesanan ini.",
    orderId: "Order ID",
    accountDetailTitle: "Detail Akun Pesanan",
    accountDetailDesc: "Detail ini hanya tampil untuk pesanan yang sudah selesai.",
    accountLogin: "Login akun",
    accountPassword: "Password akun",
    accountNote: "Catatan",
    accountRevealLoading: "Mengambil detail akun dari stok...",
    accountRevealFailed: "Detail akun belum bisa dibuka.",
    accountRealNote: "Detail akun asli dari stok toko. Simpan data ini baik-baik.",
    credentialRetentionNote: "Simpan detail akun ini sekarang. Riwayat pesanan dan credential akan dibersihkan otomatis setelah 30 hari.",
    accountDemoNote: "Detail akun dummy untuk preview UI. Backend nanti mengisi akun asli dari stok bot.",
    copyText: "Salin",
    copiedText: "Tersalin",
    close: "Tutup",
    authRegisterTitle: "Daftar Akun",
    authLoginTitle: "Masuk Akun",
    authForgotTitle: "Reset Password",
    authDesc: "Daftar atau masuk untuk menyimpan riwayat order yang berhasil dibayar.",
    name: "Nama",
    email: "Email",
    buyerName: "Nama pembeli",
    verificationCode: "Kode Verifikasi",
    codePlaceholder: "6 digit kode email",
    password: "Password",
    newPassword: "Password Baru",
    passwordPlaceholder: "Password akun web",
    sendVerify: "Kirim Kode Verifikasi",
    verifyRegister: "Verifikasi & Daftar",
    sendReset: "Kirim Kode Reset",
    resetPassword: "Reset Password",
    processing: "Memproses...",
    forgotPassword: "Lupa password?",
    backLogin: "Kembali masuk",
    quantity: "Jumlah Beli",
    variant: "Varian",
    buyerData: "Data Pembeli",
    whatsappOptional: "WhatsApp (opsional)",
    checkoutEmailNote: "Email dipakai sebagai identitas pesanan. Daftar akun agar status dan riwayat order bisa kamu cek kapan saja.",
    haveAccount: "Sudah punya akun?",
    subtotal: "Subtotal",
    total: "Total",
    continuePayment: "Lanjut ke Pembayaran",
    checkoutFailed: "Checkout gagal. Coba ulang beberapa saat lagi.",
    invalidEmail: "Masukkan email yang valid.",
    emailRequired: "Email wajib diisi.",
    checkoutHint: "Isi email, lalu pilih metode bayar di halaman berikutnya.",
    payWithin: "Bayar dalam",
    paymentHowTitle: "Cara bayar",
    paymentHowOpen: "Buka E-Wallet atau M-Banking",
    paymentHowScan: "Scan QRIS dan pastikan nominal pembayaran sesuai.",
    paymentHowCheck: "Klik perbarui status setelah transfer",
    paymentDetails: "Detail Pembayaran",
    merchantRef: "Merchant Ref",
    method: "Metode",
    createdAt: "Dibuat",
    summary: "Ringkasan",
    uniqueCode: "Kode unik",
    refreshStatus: "Perbarui status",
    checkingStatus: "Mengecek status...",
    paymentSuccess: "Pembayaran sukses",
    paymentExpired: "Pembayaran Gagal",
    paymentExpiredDesc: "Pembayaran tidak dapat diproses atau sudah kedaluwarsa.",
    paymentSuccessNotice: "Pembayaran terverifikasi. Pesanan sudah masuk riwayat akun.",
    paymentRedirectPrefix: "Halaman akan pindah ke detail pesanan dalam",
    paymentRedirectSuffix: "detik.",
    createNewOrder: "Buat Pesanan Baru",
    accountOffer: "Akun Web",
    registerFirst: "Daftar dulu?",
    registerOfferDesc: "Daftar akun agar kamu bisa melihat riwayat pesanan, status order, dan repeat order dengan email yang sama.",
    continueGuest: "Lanjutkan tanpa daftar",
    sensitiveSafe: "Credential pesanan tidak ditampilkan di riwayat publik.",
    waitingPayment: "Menunggu Pembayaran",
    product: "Produk",
    qty: "Jumlah",
    footerReceipt: "Digital Order Receipt",
    footerStore: "Store",
    footerStoreDesc: "Toko produk digital dengan checkout cepat dan pengiriman detail pesanan otomatis.",
    footerSupport: "Support",
    footerSystem: "System",
    payment: "Payment",
    delivery: "Delivery",
    author: "Author",
  },
  en: {
    home: "Home",
    products: "Products",
    howto: "How To Order",
    status: "Orders",
    register: "Sign Up",
    login: "Login",
    logout: "Logout",
    profile: "My Profile",
    myOrders: "My Orders",
    profileGreeting: "Hello",
    profileWelcome: "Welcome to your dashboard.",
    shopAgain: "Shop Again",
    totalOrders: "Total Orders",
    completedOrders: "Completed",
    totalSpent: "Total Spent",
    profileFormTitle: "My Profile",
    whatsappHelp: "For WhatsApp order notifications once this feature is connected.",
    saveProfile: "Save Profile",
    passwordFormTitle: "Create Password",
    newPasswordRepeat: "Repeat New Password",
    makePassword: "Create Password",
    profileSaved: "Profile saved.",
    passwordSaved: "Password updated.",
    passwordTooShort: "Password must be at least 6 characters.",
    passwordMismatch: "New passwords do not match.",
    passwordSetupTitle: "Create Account Password",
    passwordSetupDesc: "Your account was created automatically from the first checkout. Verify your email before creating a password.",
    passwordSetupWarning: "This account does not have a password yet.\nCreate one so order history can be accessed again from another device.",
    passwordSetupCta: "Create Password Now",
    passwordSetupSent: "Password setup code has been sent to email.",
    passwordSetupDone: "Account password has been created.",
    emailAlreadyUsedTitle: "Email already used",
    emailAlreadyUsedDesc: "For security, checkout with the same email requires login or account password setup.",
    useAnotherEmail: "Use Another Email",
    emailRegisteredLogin: "This email is registered. Please login to continue checkout.",
    emailNeedsPassword: "This email has checked out before. Create a password first or login to your account.",
    all: "ALL",
    backCatalog: "Product Catalog",
    backHome: "Home",
    checkout: "Checkout",
    checkoutFast: "Premium apps store",
    heroTitle: "Premium Apps Access, No Hassle",
    heroDesc: "Choose a product, pay with QRIS, then track your order status from the web.",
    heroCta: "View Products",
    homeBadge: "24-Hour Automated Service",
    homeAboutTitle: "Ready-to-use premium apps, fast and hassle-free.",
    homeAboutDesc: "Buy your favorite premium apps with friendly prices, store warranty, and trackable order status. Built for buyers who want a practical checkout without a long process.",
    homeFeatureFastTitle: "Best prices",
    homeFeatureFastDesc: "Premium apps options stay budget-friendly without cutting service quality.",
    homeFeatureWarrantyTitle: "Guaranteed",
    homeFeatureWarrantyDesc: "Every product includes clear store warranty terms if issues happen after ordering.",
    homeFeatureStatusTitle: "Order status",
    homeFeatureStatusDesc: "Track payment, order progress, and purchase history directly from the status page.",
    homeTagSecure: "Fast QRIS",
    homeTagProtected: "Buyer privacy",
    homeTagDelivery: "Ready access",
    homeTagSupport: "Active support",
    statOrders: "Completed orders",
    statProducts: "Premium products",
    statService: "Automated service",
    premiumApps: "Premium Apps",
    topProducts: "Top Products",
    qrisReady: "QRIS Payment",
    readyStock: "Guaranteed",
    stockRealtime: "Guaranteed",
    warranty: "Store warranty",
    productMetaStock: "Available stock",
    productMetaProcess: "Process",
    productMetaPayment: "Payment",
    productMetaProcessValue: "Automatic",
    buyNow: "Buy Now",
    outOfStock: "Out of Stock",
    productReady: "Digital product ready to order.",
    stock: "Stock",
    codeDemo: "Demo code",
    resetCodeSent: "Reset code has been sent to email.",
    passwordResetDone: "Password has been reset. Please login.",
    verificationCodeSent: "Verification code has been sent to email.",
    catalogTitle: "Product Catalog",
    searchProduct: "Search product...",
    loadingCatalog: "Loading catalog",
    orderFlowTitle: "Quick shopping flow",
    orderFlow1Title: "Choose product",
    orderFlow1Desc: "Find the digital product you need, then choose the variant and order quantity.",
    orderFlow2Title: "Fill buyer data",
    orderFlow2Desc: "Enter an active email as your order identity and history access after successful payment.",
    orderFlow3Title: "Pay QRIS",
    orderFlow3Desc: "Scan QRIS, wait for validation, then check your order status from the transaction page.",
    statusTitle: "Order status & history",
    statusDesc: "Check transactions and order history from one account page.",
    statusOverviewPending: "Unpaid",
    statusOverviewCanceled: "Canceled / expired",
    statusOverviewDone: "Completed",
    statusSearchNote: "Enter a transaction code to check a specific order status.",
    txCode: "Transaction Code",
    txPlaceholder: "example: WX-12345",
    checkStatus: "Check Status",
    txRequired: "Enter a transaction code first.",
    txNotFound: "Transaction was not found.",
    txFoundPending: "Transaction found and still waiting for payment.",
    txFoundExpired: "Transaction found, but payment has expired.",
    txFoundDone: "Transaction found. Order detail opened.",
    pending: "Waiting Payment",
    canceled: "Canceled",
    expired: "Expired",
    done: "Completed",
    pendingEmpty: "No orders are currently waiting for payment.",
    canceledEmpty: "No canceled or expired orders yet.",
    doneEmpty: "No completed orders yet.",
    credentialSafe: "Credentials are not shown on the status page. Sensitive details only appear through a verified reveal flow.",
    dataWillShow: "Data will appear automatically once the order status backend is connected.",
    viewAccountDetail: "View Account Detail",
    payNow: "Pay Now",
    viewSummary: "View Summary",
    orderSummaryTitle: "Order Summary",
    orderSummaryDesc: "Product details and payment reference for this order.",
    orderId: "Order ID",
    accountDetailTitle: "Order Account Detail",
    accountDetailDesc: "This detail only appears for completed orders.",
    accountLogin: "Account login",
    accountPassword: "Account password",
    accountNote: "Note",
    accountRevealLoading: "Loading account detail from stock...",
    accountRevealFailed: "Account detail cannot be opened yet.",
    accountRealNote: "Real account detail from store stock. Keep this data safe.",
    credentialRetentionNote: "Save this account detail now. Order history and credentials are automatically cleared after 30 days.",
    accountDemoNote: "Dummy account detail for UI preview. Backend will fill the real account from bot stock.",
    copyText: "Copy",
    copiedText: "Copied",
    close: "Close",
    authRegisterTitle: "Create Account",
    authLoginTitle: "Login Account",
    authForgotTitle: "Reset Password",
    authDesc: "Sign up or login to save your successfully paid order history.",
    name: "Name",
    email: "Email",
    buyerName: "Buyer name",
    verificationCode: "Verification Code",
    codePlaceholder: "6-digit email code",
    password: "Password",
    newPassword: "New Password",
    passwordPlaceholder: "Web account password",
    sendVerify: "Send Verification Code",
    verifyRegister: "Verify & Sign Up",
    sendReset: "Send Reset Code",
    resetPassword: "Reset Password",
    processing: "Processing...",
    forgotPassword: "Forgot password?",
    backLogin: "Back to login",
    quantity: "Buy Quantity",
    variant: "Variant",
    buyerData: "Buyer Data",
    whatsappOptional: "WhatsApp (optional)",
    checkoutEmailNote: "Email is used as your order identity. Create an account to check status and order history anytime.",
    haveAccount: "Already have an account?",
    subtotal: "Subtotal",
    total: "Total",
    continuePayment: "Continue to Payment",
    checkoutFailed: "Checkout failed. Please try again shortly.",
    invalidEmail: "Enter a valid email address.",
    emailRequired: "Email is required.",
    checkoutHint: "Enter email, then choose a payment method on the next page.",
    payWithin: "Pay within",
    paymentHowTitle: "How to pay",
    paymentHowOpen: "Open your E-Wallet or mobile banking",
    paymentHowScan: "Scan QRIS and make sure the payment amount matches.",
    paymentHowCheck: "Refresh status after payment",
    paymentDetails: "Payment Details",
    merchantRef: "Merchant Ref",
    method: "Method",
    createdAt: "Created",
    summary: "Summary",
    uniqueCode: "Unique code",
    refreshStatus: "Refresh status",
    checkingStatus: "Checking status...",
    paymentSuccess: "Payment successful",
    paymentExpired: "Payment Failed",
    paymentExpiredDesc: "Payment cannot be processed or has expired.",
    paymentSuccessNotice: "Payment verified. The order has been saved to your account history.",
    paymentRedirectPrefix: "This page will open your order detail in",
    paymentRedirectSuffix: "seconds.",
    createNewOrder: "Create New Order",
    accountOffer: "Web Account",
    registerFirst: "Create an account first?",
    registerOfferDesc: "Create an account to view order history, order status, and repeat orders using the same email.",
    continueGuest: "Continue without account",
    sensitiveSafe: "Order credentials are not shown in public history.",
    waitingPayment: "Waiting Payment",
    product: "Product",
    qty: "Quantity",
    footerReceipt: "Digital Order Receipt",
    footerStore: "Store",
    footerStoreDesc: "A digital product store with fast checkout and automated order detail delivery.",
    footerSupport: "Support",
    footerSystem: "System",
    payment: "Payment",
    delivery: "Delivery",
    author: "Author",
  },
};

const getText = (language = "id") => UI_TEXT[language] || UI_TEXT.id;

const sampleProducts = [
  {
    id: 1,
    code: "gpt",
    name: "ChatGPT Plus 1 Bulan",
    category: "AI TOOLS",
    desc: "Akun premium siap pakai dengan garansi sesuai ketentuan toko.",
    isImage: false,
    image_url: "-",
    sold: 208,
    variants: [
      { name: "1 BULAN PRIVATE", price: 22000, stock: 44 },
      { name: "1 BULAN SHARING", price: 14000, stock: 12 },
    ],
  },
  {
    id: 2,
    code: "claude",
    name: "Claude Max 20x 1 Minggu",
    category: "AI TOOLS",
    desc: "Produk create by order dengan proses manual.",
    isImage: false,
    image_url: "-",
    sold: 21,
    variants: [{ name: "MAX 20X", price: 400000, stock: 2 }],
  },
  {
    id: 3,
    code: "ytb",
    name: "Youtube Premium 1 Bulan",
    category: "STREAMING",
    desc: "Premium family invite, cocok untuk pemakaian harian.",
    isImage: false,
    image_url: "-",
    sold: 112,
    variants: [{ name: "1 BULAN FAMILY", price: 15000, stock: 0 }],
  },
  {
    id: 4,
    code: "canva",
    name: "Canva Pro 1 Bulan",
    category: "CREATIVE",
    desc: "Akses desain premium untuk kebutuhan konten harian.",
    isImage: false,
    image_url: "-",
    sold: 87,
    variants: [{ name: "1 BULAN MEMBER", price: 12000, stock: 18 }],
  },
  {
    id: 5,
    code: "gemini",
    name: "Gemini Advanced 1 Bulan",
    category: "AI TOOLS",
    desc: "Akses AI premium untuk riset, coding, dan produktivitas.",
    isImage: false,
    image_url: "-",
    sold: 64,
    variants: [{ name: "1 BULAN SHARING", price: 25000, stock: 9 }],
  },
  {
    id: 6,
    code: "spotify",
    name: "Spotify Premium 1 Bulan",
    category: "STREAMING",
    desc: "Akun musik premium untuk streaming harian tanpa iklan.",
    isImage: false,
    image_url: "-",
    sold: 142,
    variants: [{ name: "1 BULAN INDIVIDUAL", price: 18000, stock: 31 }],
  },
  {
    id: 7,
    code: "capcut",
    name: "CapCut Pro 1 Bulan",
    category: "CREATIVE",
    desc: "Tools editing video premium untuk konten pendek.",
    isImage: false,
    image_url: "-",
    sold: 73,
    variants: [{ name: "1 BULAN PRO", price: 17000, stock: 14 }],
  },
  {
    id: 8,
    code: "perplexity",
    name: "Perplexity Pro 1 Bulan",
    category: "AI TOOLS",
    desc: "AI research assistant untuk cari jawaban cepat dan rapi.",
    isImage: false,
    image_url: "-",
    sold: 36,
    variants: [{ name: "1 BULAN SHARING", price: 30000, stock: 6 }],
  },
  {
    id: 9,
    code: "netflix",
    name: "Netflix Premium 1 Bulan",
    category: "STREAMING",
    desc: "Akun streaming film dan series untuk hiburan keluarga.",
    isImage: false,
    image_url: "-",
    sold: 195,
    variants: [{ name: "1 BULAN PRIVATE", price: 38000, stock: 11 }],
  },
  {
    id: 10,
    code: "notion",
    name: "Notion AI 1 Bulan",
    category: "AI TOOLS",
    desc: "Workspace produktif dengan bantuan AI untuk catatan dan kerja.",
    isImage: false,
    image_url: "-",
    sold: 28,
    variants: [{ name: "1 BULAN PRO", price: 21000, stock: 7 }],
  },
];

function rupiah(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function getOrderTimestamp(order = {}) {
  const value = order.paid_at || order.paidAt || order.created_at || order.createdAt || 0;
  const raw = Number(value || 0);
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return raw < 1_000_000_000_000 ? raw * 1000 : raw;
}

function formatOrderTimestamp(order = {}, language = "id") {
  const timestamp = getOrderTimestamp(order);
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleString(
    language === "id" ? "id-ID" : "en-US",
    { dateStyle: "medium", timeStyle: "short" }
  );
}

function normalizeProducts(payload) {
  const list = Array.isArray(payload) ? payload : payload?.products;
  return Array.isArray(list) ? list : [];
}

function normalizeStoreInfo(payload) {
  const store = payload && typeof payload === "object" && !Array.isArray(payload) ? payload.store : null;
  const stats = payload && typeof payload === "object" && !Array.isArray(payload) ? payload.stats : null;
  return {
    name: String(store?.name || "").trim(),
    brandTitle: String(store?.brand_title || store?.brandTitle || "").trim(),
    stats: {
      completedOrders: Number(stats?.completed_orders ?? stats?.completedOrders ?? NaN),
      completedTransactions: Number(stats?.completed_transactions ?? stats?.completedTransactions ?? NaN),
      totalProducts: Number(stats?.total_products ?? stats?.totalProducts ?? NaN),
    },
  };
}

function getStoreDisplayName(storeInfo = {}) {
  return String(storeInfo.name || storeInfo.brandTitle || DEFAULT_STORE_BRAND).trim();
}

async function apiFetch(path, options = {}) {
  if (!API_BASE_URL) throw new Error("API base URL kosong");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.message || `API ${response.status}`);
    error.code = payload?.code || `HTTP_${response.status}`;
    error.details = payload?.details || {};
    throw error;
  }
  return payload;
}

async function loadProducts() {
  const payload = await apiFetch("/api/web/products");
  return normalizeProducts(payload);
}

async function loadStorefrontData() {
  const payload = await apiFetch("/api/web/products");
  return {
    products: normalizeProducts(payload),
    storeInfo: normalizeStoreInfo(payload),
  };
}

async function createCheckout(payload) {
  try {
    const response = await apiFetch("/api/web/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response?.order || response;
  } catch (err) {
    if (err?.code && err.code !== "HTTP_404") throw err;
    const baseAmount = Number(payload.amount || payload.total_amount || 0);
    let payableAmount = baseAmount;
    const activeOrders = loadDemoOrders().filter((order) => {
      const status = String(order.status || "").toLowerCase();
      const expiresAt = Number(order.expires_at || order.expiresAt || 0);
      return status === "pending" && (!expiresAt || expiresAt > Date.now());
    });
    for (let i = 0; i < 1000; i += 1) {
      const hasCollision = activeOrders.some((order) => Number(order.total_amount || order.amount || 0) === payableAmount);
      if (!hasCollision) break;
      payableAmount += 1;
    }
    const expiresAt = Date.now() + DEMO_PAYMENT_EXPIRES_MS;
    return {
      reference_id: `WX-DEMO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      status: "pending",
      expires_at: expiresAt,
      amount: baseAmount,
      total_amount: payableAmount,
      qris_image_url: "",
    };
  }
}

function isDemoReference(reference) {
  return String(reference || "").trim().toUpperCase().startsWith("WX-DEMO-");
}

async function refreshOrderStatus(reference) {
  const response = await apiFetch(`/api/web/orders/${encodeURIComponent(reference)}/refresh`, {
    method: "POST",
  });
  return response?.order || response;
}

async function revealOrderAccounts(reference) {
  return apiFetch(`/api/web/orders/${encodeURIComponent(reference)}/accounts`, {
    method: "POST",
  });
}

function getOrderSubtotal(order = {}) {
  const directAmount = Number(order.amount);
  if (Number.isFinite(directAmount) && directAmount > 0) return directAmount;
  const qty = Math.max(Number(order.qty || 1), 1);
  const variantPrice = Number(order.variant?.price || 0);
  if (variantPrice > 0) return variantPrice * qty;
  return Number(order.total_amount || 0);
}

function getOrderPayableAmount(order = {}) {
  const total = Number(order.total_amount);
  if (Number.isFinite(total) && total > 0) return total;
  return getOrderSubtotal(order);
}

function getOrderUniqueCode(order = {}) {
  return Math.max(0, getOrderPayableAmount(order) - getOrderSubtotal(order));
}

function loadSavedCustomer() {
  try {
    const saved = JSON.parse(localStorage.getItem(WEB_CUSTOMER_KEY) || "null");
    if (!saved) return null;
    const email = normalizeEmail(saved.email || saved.contact);
    const stored = email ? loadDemoWebUsers()[email] : null;
    return stored ? makeWebCustomer(email, { ...stored, ...saved }) : saved;
  } catch {
    return null;
  }
}

function saveCustomer(customer) {
  const email = normalizeEmail(customer?.email || customer?.contact);
  const stored = email ? loadDemoWebUsers()[email] : null;
  const nextCustomer = email ? makeWebCustomer(email, { ...stored, ...customer }) : customer;
  localStorage.setItem(WEB_CUSTOMER_KEY, JSON.stringify(nextCustomer));
  return nextCustomer;
}

function clearSavedCustomer() {
  localStorage.removeItem(WEB_CUSTOMER_KEY);
}

function getAccountEmail(account = null) {
  return String(account?.email || account?.contact || "").trim();
}

function getAccountDisplayName(account = null) {
  const email = getAccountEmail(account);
  const fromEmail = email.includes("@") ? email.split("@")[0] : email;
  return String(fromEmail || account?.name || "akun").trim();
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function loadDemoWebUsers() {
  try {
    return JSON.parse(localStorage.getItem(WEB_USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveDemoWebUsers(users) {
  localStorage.setItem(WEB_USERS_KEY, JSON.stringify(users));
}

function getWebUser(email) {
  const key = normalizeEmail(email);
  return key ? loadDemoWebUsers()[key] || null : null;
}

function webUserHasPassword(user) {
  return Boolean(user?.password || user?.passwordSet);
}

function accountHasPassword(account) {
  const email = normalizeEmail(account?.email || account?.contact);
  return webUserHasPassword(getWebUser(email));
}

function getOrderStorageTimestamp(order = {}) {
  const timestamp = getOrderTimestamp(order) || Number(order.updatedAt || 0);
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : 0;
}

function isOrderWithinRetention(order = {}) {
  const timestamp = getOrderStorageTimestamp(order);
  if (!timestamp) return true;
  return Date.now() - timestamp <= ORDER_HISTORY_RETENTION_MS;
}

function pruneStoredOrders(storageKey) {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(stored)) return [];
    const fresh = stored.filter(isOrderWithinRetention);
    if (fresh.length !== stored.length) {
      localStorage.setItem(storageKey, JSON.stringify(fresh));
    }
    return fresh;
  } catch {
    return [];
  }
}

function loadOrderHistory(customer = null) {
  try {
    const history = pruneStoredOrders(WEB_ORDER_HISTORY_KEY);
    if (!customer?.email && !customer?.contact) return [];
    const email = normalizeEmail(customer.email || customer.contact);
    return history
      .filter((order) => normalizeEmail(order.email) === email)
      .sort((a, b) => getOrderStorageTimestamp(b) - getOrderStorageTimestamp(a));
  } catch {
    return [];
  }
}

function loadDemoOrders() {
  return pruneStoredOrders(WEB_DEMO_ORDERS_KEY);
}

function saveDemoOrder(order = {}) {
  if (!order.reference_id) return order;
  const email = normalizeEmail(order.email || order.access?.customer?.email || order.access?.customer?.contact || "");
  const orderRecord = {
    reference_id: order.reference_id,
    productName: order.product?.name || order.productName || "-",
    variantName: order.variant?.name || order.variantName || "-",
    qty: order.qty || 1,
    amount: order.amount || order.total_amount || 0,
    total_amount: order.total_amount || order.amount || 0,
    email,
    status: String(order.status || "pending").toLowerCase(),
    expires_at: order.expires_at || order.expiresAt || 0,
    createdAt: order.created_at || order.createdAt || Date.now(),
    paidAt: order.paid_at || order.paidAt || 0,
    accountDetail: order.accountDetail || buildOrderAccountDetail({ ...order, email }),
  };
  const orders = loadDemoOrders().filter((item) => item.reference_id !== orderRecord.reference_id);
  localStorage.setItem(WEB_DEMO_ORDERS_KEY, JSON.stringify([orderRecord, ...orders].slice(0, 150)));
  return orderRecord;
}

function findDemoOrder(reference = "") {
  const key = String(reference || "").trim().toUpperCase();
  if (!key) return null;
  const history = [];
  history.push(...pruneStoredOrders(WEB_ORDER_HISTORY_KEY));
  history.push(...loadDemoOrders());
  return history.find((order) => String(order.reference_id || "").trim().toUpperCase() === key) || null;
}

function buildOrderAccountDetail(order = {}) {
  const email = normalizeEmail(order.email || order.access?.customer?.email || order.access?.customer?.contact || "buyer@web.local");
  const emailName = email.split("@")[0]?.replace(/[^a-z0-9]+/gi, "").slice(0, 12) || "buyer";
  const refTail = String(order.reference_id || order.id || Date.now())
    .replace(/[^a-zA-Z0-9]+/g, "")
    .slice(-6)
    .toUpperCase() || "WXDEMO";
  const productSeed = String(order.product?.code || order.productCode || order.productName || "premium")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 10) || "premium";
  const existing = order.accountDetails?.[0] || order.accounts?.[0] || order.accountDetail || order.credential || order.credentials?.[0] || {};

  return {
    username: existing.username || existing.email || existing.login || `${productSeed}.${emailName}.${refTail.toLowerCase()}@demo.local`,
    password: existing.password || existing.pass || `WX-${refTail}-${String(order.qty || 1).padStart(2, "0")}`,
    note: existing.note || "",
  };
}

function savePaidOrderToHistory(order) {
  const status = String(order?.status || "").toLowerCase();
  if (!["paid", "success", "completed"].includes(status)) return;
  const customer = order.access?.customer;
  const email = normalizeEmail(customer?.email || customer?.contact || order.email);
  if (!email) return;

  const history = loadOrderHistory({ email });
  if (history.some((item) => item.reference_id === order.reference_id)) return;
  const nextOrder = {
    reference_id: order.reference_id,
    productName: order.product?.name || "-",
    variantName: order.variant?.name || "-",
    qty: order.qty || 1,
    amount: order.amount || order.total_amount || 0,
    total_amount: order.total_amount || order.amount || 0,
    email,
    status,
    paidAt: order.paid_at || Date.now(),
    accountDetail: buildOrderAccountDetail({ ...order, email }),
  };
  const allHistory = pruneStoredOrders(WEB_ORDER_HISTORY_KEY).filter((item) => item.reference_id !== nextOrder.reference_id);
  localStorage.setItem(WEB_ORDER_HISTORY_KEY, JSON.stringify([nextOrder, ...allHistory].slice(0, 100)));
  saveDemoOrder({ ...order, ...nextOrder, status: "paid" });
}

function prepareOrderForPayment(order = {}, account = null) {
  const qty = Number(order.qty || 1);
  const amount = getOrderSubtotal(order);
  const totalAmount = getOrderPayableAmount(order);
  const variantPrice = qty > 0 ? Math.round(amount / qty) : amount;
  const email = normalizeEmail(order.email || account?.email || account?.contact || "");
  const productName = order.product?.name || order.productName || "-";
  const variantName = order.variant?.name || order.variantName || "-";

  return {
    ...order,
    product: order.product || {
      id: order.productId || order.product_id || order.productCode || productName,
      code: order.productCode || productName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: productName,
    },
    variant: order.variant || {
      name: variantName,
      price: variantPrice,
      stock: Number(order.stock || 0),
    },
    qty,
    amount,
    total_amount: totalAmount,
    access: order.access || (account
      ? { type: "account", customer: account, saveHistory: true }
      : (email ? { type: "guest", customer: { email, contact: email }, saveHistory: false } : { type: "guest", saveHistory: false })),
  };
}

function shouldShowPasswordSetupReminder(account) {
  return Boolean(account && !accountHasPassword(account) && loadOrderHistory(account).length > 0);
}

function makeWebCustomer(email, data = {}) {
  return {
    id: data.id || `WEB-${email}`,
    name: data.name || email,
    contact: email,
    email,
    whatsapp: data.whatsapp || data.phone || "",
    passwordSet: Boolean(data.passwordSet || data.password),
    createdFrom: data.createdFrom || data.source || "web",
    registeredAt: data.registeredAt || Date.now(),
  };
}

function createGuestCheckoutCustomer(email, data = {}) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  const users = loadDemoWebUsers();
  const current = users[normalized] || {};
  const customer = makeWebCustomer(normalized, {
    ...current,
    ...data,
    name: data.name || current.name || normalized.split("@")[0] || normalized,
    passwordSet: false,
    createdFrom: current.createdFrom || "guest_checkout",
  });
  users[normalized] = {
    ...current,
    ...customer,
    password: current.password || "",
    passwordSet: Boolean(current.password),
    verified: true,
    updatedAt: Date.now(),
  };
  saveDemoWebUsers(users);
  return saveCustomer(customer);
}

function saveWebCustomerProfile(customer, previousEmail = "") {
  const email = normalizeEmail(customer?.email || customer?.contact);
  if (!email) return customer;

  const users = loadDemoWebUsers();
  const previousKey = normalizeEmail(previousEmail);
  const previousUser = users[previousKey] || users[email] || {};
  const nextCustomer = makeWebCustomer(email, {
    ...previousUser,
    ...customer,
    name: String(customer?.name || previousUser.name || email).trim(),
    whatsapp: String(customer?.whatsapp || previousUser.whatsapp || "").trim(),
  });

  if (previousKey && previousKey !== email) delete users[previousKey];
  if (previousKey && previousKey !== email) {
    try {
      const history = pruneStoredOrders(WEB_ORDER_HISTORY_KEY);
      if (Array.isArray(history)) {
        localStorage.setItem(
          WEB_ORDER_HISTORY_KEY,
          JSON.stringify(history.map((order) => (
            normalizeEmail(order.email) === previousKey ? { ...order, email } : order
          )))
        );
      }
    } catch {}
    try {
      const orders = loadDemoOrders();
      localStorage.setItem(
        WEB_DEMO_ORDERS_KEY,
        JSON.stringify(orders.map((order) => (
          normalizeEmail(order.email) === previousKey ? { ...order, email } : order
        )))
      );
    } catch {}
  }
  users[email] = {
    ...previousUser,
    ...nextCustomer,
    password: previousUser.password,
    passwordSet: Boolean(previousUser.password || previousUser.passwordSet),
    verified: previousUser.verified !== false,
    updatedAt: Date.now(),
  };
  saveDemoWebUsers(users);
  return saveCustomer(nextCustomer);
}

async function saveWebCustomerPassword(account, password) {
  const email = normalizeEmail(account?.email || account?.contact);
  if (!email) return null;
  if (API_BASE_URL) {
    const result = await apiFetch("/api/web/me/password", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const customer = makeWebCustomer(email, result.customer || result.user || { ...(account || {}), passwordSet: true });
    const users = loadDemoWebUsers();
    users[email] = {
      ...(users[email] || {}),
      ...customer,
      passwordSet: true,
      verified: true,
      updatedAt: Date.now(),
    };
    saveDemoWebUsers(users);
    return saveCustomer(customer);
  }

  const users = loadDemoWebUsers();
  const current = users[email] || makeWebCustomer(email, account || {});
  const nextCustomer = makeWebCustomer(email, {
    ...current,
    ...(account || current),
    passwordSet: true,
  });
  users[email] = {
    ...current,
    ...nextCustomer,
    password,
    passwordSet: true,
    verified: current.verified !== false,
    updatedAt: Date.now(),
  };
  saveDemoWebUsers(users);
  return saveCustomer(nextCustomer);
}

async function requestAuthCode(payload) {
  try {
    return await apiFetch("/api/web/auth/request-code", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (API_BASE_URL && err?.code !== "HTTP_404") throw err;
    return {
      ok: true,
      demo: true,
      expires_at: Date.now() + 10 * 60 * 1000,
    };
  }
}

async function verifyRegisterCode({ name, email, password, code }) {
  const normalizedEmail = normalizeEmail(email);
  try {
    return await apiFetch("/api/web/auth/register/verify", {
      method: "POST",
      body: JSON.stringify({ name, email: normalizedEmail, password, code }),
    });
  } catch (err) {
    if (API_BASE_URL && err?.code !== "HTTP_404") throw err;
    if (String(code).trim() !== DEMO_VERIFICATION_CODE) throw new Error("Kode verifikasi salah.");
    const users = loadDemoWebUsers();
    if (users[normalizedEmail]) throw new Error("Email sudah pernah digunakan. Silakan masuk atau buat password.");
    const customer = makeWebCustomer(normalizedEmail, { name, passwordSet: true });
    users[normalizedEmail] = {
      ...customer,
      password,
      passwordSet: true,
      verified: true,
      updatedAt: Date.now(),
    };
    saveDemoWebUsers(users);
    return { customer };
  }
}

async function loginCustomer({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  try {
    return await apiFetch("/api/web/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: normalizedEmail, password }),
    });
  } catch (err) {
    if (API_BASE_URL && err?.code !== "HTTP_404") throw err;
    const user = loadDemoWebUsers()[normalizedEmail];
    if (!user) throw new Error("Email belum terdaftar.");
    if (!webUserHasPassword(user)) throw new Error("Akun ini belum punya password. Buat password dulu.");
    if (user.password !== password) throw new Error("Email atau password salah.");
    return { customer: makeWebCustomer(normalizedEmail, user) };
  }
}

async function resetCustomerPassword({ email, code, password }) {
  const normalizedEmail = normalizeEmail(email);
  try {
    return await apiFetch("/api/web/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email: normalizedEmail, code, password }),
    });
  } catch (err) {
    if (API_BASE_URL && err?.code !== "HTTP_404") throw err;
    if (String(code).trim() !== DEMO_VERIFICATION_CODE) throw new Error("Kode reset salah.");
    const users = loadDemoWebUsers();
    if (!users[normalizedEmail]) throw new Error("Email belum terdaftar.");
    users[normalizedEmail] = { ...users[normalizedEmail], password, passwordSet: true, verified: true, updatedAt: Date.now() };
    saveDemoWebUsers(users);
    return { ok: true, customer: makeWebCustomer(normalizedEmail, users[normalizedEmail]) };
  }
}

function getProductImage(product) {
  if (product?.isImage && product?.image_url && product.image_url !== "-") return product.image_url;
  return "";
}

function getProductWebIcon(product) {
  return String(product?.web?.icon_url || product?.web_icon_url || product?.webIconUrl || "").trim();
}

function guessCategory(product) {
  const text = `${product?.category || ""} ${product?.name || ""} ${product?.code || ""}`.toLowerCase();
  if (/netflix|youtube|spotify|wetv|prime|vidio/.test(text)) return "STREAMING";
  if (/canva|capcut|adobe|leonardo/.test(text)) return "CREATIVE";
  if (/gpt|gemini|grok|claude|perplexity|notion|merlin|kiro|ai/.test(text)) return "AI TOOLS";
  return product?.category || "DIGITAL";
}

function productStats(product) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const stock = variants.reduce((sum, item) => sum + Number(item.stock || 0), 0);
  const prices = variants.map((item) => Number(item.price || 0)).filter(Boolean);
  return {
    stock,
    minPrice: prices.length ? Math.min(...prices) : 0,
    variants,
  };
}

function productInitials(product) {
  return String(product?.name || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Countdown({ expiresAt, onExpire }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hasExpiry = Number(expiresAt || 0) > 0;
  const remaining = hasExpiry ? Math.max(0, Number(expiresAt || 0) - now) : 0;
  useEffect(() => {
    if (hasExpiry && remaining <= 0) onExpire?.();
  }, [hasExpiry, remaining, onExpire]);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <span className={hasExpiry && !remaining ? "countdown expired" : "countdown"}>
      {hasExpiry ? `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}` : "--:--"}
    </span>
  );
}

function togglePasswordVisibility(event, inputRef, setVisible) {
  event.preventDefault();
  const input = inputRef?.current;
  const selectionStart = input?.selectionStart;
  const selectionEnd = input?.selectionEnd;
  setVisible((value) => !value);
  window.requestAnimationFrame(() => {
    input?.focus?.({ preventScroll: true });
    if (input && selectionStart !== null && selectionStart !== undefined && selectionEnd !== null && selectionEnd !== undefined) {
      try {
        input.setSelectionRange(selectionStart, selectionEnd);
      } catch {}
    }
  });
}

function ProductVisual({ product }) {
  const image = getProductImage(product);
  const category = guessCategory(product);
  const initials = productInitials(product);

  return (
    <div className={`product-visual tone-${category.toLowerCase().replace(/\s+/g, "-")}`}>
      {image ? (
        <img src={image} alt={product.name} />
      ) : (
        <div className="fallback-mark">
          <Sparkles size={18} />
          <span>{initials}</span>
        </div>
      )}
    </div>
  );
}

function PasswordSetupBanner({ language = "id", onAction }) {
  const text = getText(language);

  return (
    <div className="global-password-warning">
      <div>
        <KeyRound size={18} />
        <span>{text.passwordSetupWarning}</span>
      </div>
      {onAction ? (
        <button type="button" onClick={onAction}>
          {text.passwordSetupCta}
        </button>
      ) : null}
    </div>
  );
}

function ProductCard({ product, text = getText(), onBuy, animationIndex = 0 }) {
  const { stock, minPrice } = productStats(product);
  const category = guessCategory(product);
  const hot = Number(product?.sold || 0) >= 50;
  const canBuy = stock > 0;
  const handleOpen = () => {
    if (canBuy) onBuy(product);
  };
  const handleKeyDown = (event) => {
    if (!canBuy) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onBuy(product);
    }
  };

  return (
    <article
      className={`product-card ${canBuy ? "is-clickable" : "is-disabled"}`}
      role={canBuy ? "button" : undefined}
      tabIndex={canBuy ? 0 : undefined}
      aria-disabled={canBuy ? undefined : true}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      style={{ "--card-delay": `${Math.min(animationIndex, 9) * 45}ms` }}
    >
      <ProductVisual product={product} />
      <div className="badge-row">
        <span className="category-pill">{category}</span>
        {hot ? <span className="hot-pill">TERLARIS</span> : null}
      </div>
      <h2>{product.name}</h2>
      <p className="product-desc">{product.desc || text.productReady}</p>
      <div className="metrics">
        <span><Star size={14} /> 5.0</span>
        <span><Eye size={14} /> {Number(product.sold || 0).toLocaleString("id-ID")}</span>
        <span><Boxes size={14} /> {stock}</span>
      </div>
      <div className="card-footer">
        <strong>{rupiah(minPrice)}</strong>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleOpen();
          }}
          disabled={!canBuy}
        >
          {canBuy ? text.buyNow : text.outOfStock}
        </button>
      </div>
    </article>
  );
}

function BuyerReviewsPanel() {
  const reviewPageSize = 4;
  const fiveStarReviews = buyerReviews.filter((review) => Number(review.rating || 5) > 4);
  const totalPages = Math.max(1, Math.ceil(fiveStarReviews.length / reviewPageSize));
  const [page, setPage] = useState(0);
  const safePage = Math.min(page, totalPages - 1);
  const pageReviews = fiveStarReviews.slice(
    safePage * reviewPageSize,
    safePage * reviewPageSize + reviewPageSize
  );
  const hasPagination = totalPages > 1;

  return (
    <section className="buyer-reviews" aria-label="Ulasan Pembeli">
      <div className="review-head">
        <span><Star size={20} fill="currentColor" /> Ulasan Pembeli</span>
        <strong>Rating 5.0</strong>
      </div>
      <div className="review-list">
        {pageReviews.map((review) => (
          <article key={`${review.name}-${review.date}`}>
            <div className="review-meta">
              <span className="review-stars" aria-label="5 bintang">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={13} fill="currentColor" />
                ))}
              </span>
              <div className="review-person">
                <strong>{review.name}</strong>
                <time>{review.date}</time>
              </div>
            </div>
            <p>{review.text}</p>
          </article>
        ))}
      </div>
      {hasPagination ? (
        <div className="review-pager">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
            disabled={safePage === 0}
          >
            <ChevronLeft size={15} /> Sebelumnya
          </button>
          <span>{safePage + 1}/{totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(current + 1, totalPages - 1))}
            disabled={safePage >= totalPages - 1}
          >
            Selanjutnya <ChevronRight size={15} />
          </button>
        </div>
      ) : null}
    </section>
  );
}

function RecentPurchaseToast({ products }) {
  const purchasable = useMemo(
    () => products.filter((product) => productStats(product).stock > 0),
    [products]
  );
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!purchasable.length || dismissed) return undefined;
    const timer = setTimeout(() => {
      if (visible) {
        setVisible(false);
        return;
      }
      setIndex((current) => (current + 1) % purchasable.length);
      setVisible(true);
    }, visible ? 5200 : 4200);
    return () => clearTimeout(timer);
  }, [dismissed, purchasable.length, visible]);

  if (dismissed || !purchasable.length) return null;

  const product = purchasable[index % purchasable.length];
  const buyerName = demoBuyerNames[index % demoBuyerNames.length];
  const minutesAgo = (index % 4) + 1;
  const initials = productInitials(product);

  return (
    <aside className={visible ? "purchase-toast show" : "purchase-toast hide"} aria-live="polite">
      <div className="toast-avatar">
        <span>{initials}</span>
      </div>
      <div className="toast-copy">
        <p><b>{buyerName}</b> baru saja membeli</p>
        <strong>{product.name}</strong>
        <span>✓ Terverifikasi · {minutesAgo} menit lalu</span>
      </div>
      <button type="button" aria-label="Tutup notifikasi pembelian" onClick={() => setDismissed(true)}>
        <X size={15} />
      </button>
    </aside>
  );
}

function loadTurnstileScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser tidak tersedia."));
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!window.__warungxitTurnstileScript) {
    window.__warungxitTurnstileScript = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.turnstile);
      script.onerror = () => reject(new Error("Gagal memuat Cloudflare Turnstile."));
      document.head.appendChild(script);
    });
  }
  return window.__warungxitTurnstileScript;
}

function TurnstileBox({ siteKey, onTokenChange }) {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  const [status, setStatus] = useState(siteKey ? "Memuat verifikasi..." : "Demo verification");

  useEffect(() => {
    let active = true;
    onTokenChange("");

    if (!siteKey) {
      onTokenChange("demo-turnstile-token");
      setStatus("Demo verification");
      return () => onTokenChange("");
    }

    loadTurnstileScript()
      .then((turnstile) => {
        if (!active || !containerRef.current || widgetRef.current || !turnstile) return;
        widgetRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "light",
          size: "flexible",
          callback: (token) => {
            onTokenChange(token);
            setStatus("Success!");
          },
          "expired-callback": () => {
            onTokenChange("");
            setStatus("Verifikasi expired, ulangi lagi.");
          },
          "error-callback": () => {
            onTokenChange("");
            setStatus("Verifikasi gagal dimuat.");
          },
        });
      })
      .catch((err) => setStatus(err.message || "Gagal memuat verifikasi."));

    return () => {
      active = false;
      onTokenChange("");
      if (widgetRef.current && window.turnstile?.remove) {
        try { window.turnstile.remove(widgetRef.current); } catch {}
      }
      widgetRef.current = null;
    };
  }, [siteKey, onTokenChange]);

  if (!siteKey) {
    return (
      <div className="verification-box turnstile-demo">
        <CheckCircle2 size={23} />
        <span>{status}</span>
        <b>Turnstile</b>
      </div>
    );
  }

  return (
    <div className="turnstile-shell">
      <div ref={containerRef}></div>
      <span>{status}</span>
    </div>
  );
}

function AccessPanel({ initialMode = "register", initialContact = "", language = "id", storeInfo = {}, onBack, onContinue, onNavigate }) {
  const text = getText(language);
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState("form");
  const [name, setName] = useState("");
  const [contact, setContact] = useState(initialContact);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordInputRef = useRef(null);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setStep("form");
    setCode("");
    setPassword("");
    setMessage("");
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (loading) return;
    const email = normalizeEmail(contact);
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "login") {
        const result = await loginCustomer({ email, password });
        const customer = saveCustomer(result.customer);
        onContinue({ type: "account", customer, saveHistory: true });
        return;
      }

      if (mode === "forgot" || mode === "password") {
        if (step === "form") {
          const result = await requestAuthCode({ email, purpose: mode === "password" ? "set_password" : "reset_password" });
          setStep("code");
          setMessage(result.demo
            ? `${text.codeDemo}: ${DEMO_VERIFICATION_CODE}`
            : (mode === "password" ? text.passwordSetupSent : text.resetCodeSent));
          return;
        }
        const result = await resetCustomerPassword({ email, code, password });
        const customer = saveCustomer(result.customer || makeWebCustomer(email, { passwordSet: true }));
        setPassword("");
        setCode("");
        setMessage(mode === "password" ? text.passwordSetupDone : text.passwordResetDone);
        onContinue({ type: "account", customer, saveHistory: true });
        return;
      }

      if (step === "form") {
        const result = await requestAuthCode({ name: name.trim(), email, purpose: "register" });
        setStep("code");
        setMessage(result.demo ? `${text.codeDemo}: ${DEMO_VERIFICATION_CODE}` : text.verificationCodeSent);
        return;
      }

      const result = await verifyRegisterCode({ name: name.trim(), email, password, code });
      const customer = saveCustomer(result.customer);
      onContinue({ type: "account", customer, saveHistory: true });
    } catch (err) {
      setError(err.message || "Gagal memproses akun.");
    } finally {
      setLoading(false);
    }
  };

  const emailReady = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(contact));
  const canSubmit =
    mode === "login"
      ? emailReady && password.trim()
      : mode === "forgot" || mode === "password"
        ? (step === "form" ? emailReady : emailReady && code.trim() && password.trim())
        : (step === "form" ? emailReady && name.trim() && password.trim() : emailReady && code.trim());

  const title = mode === "forgot"
    ? text.authForgotTitle
    : mode === "password"
      ? text.passwordSetupTitle
    : mode === "login"
      ? text.authLoginTitle
      : text.authRegisterTitle;

  const buttonText = mode === "login"
    ? text.login
    : mode === "forgot" || mode === "password"
      ? (step === "form" ? (mode === "password" ? text.passwordSetupCta : text.sendReset) : (mode === "password" ? text.makePassword : text.resetPassword))
      : (step === "form" ? text.sendVerify : text.verifyRegister);

  const description = mode === "password" ? text.passwordSetupDesc : text.authDesc;
  const showPasswordInput = mode === "login" || (mode === "register" && step === "form") || ((mode === "forgot" || mode === "password") && step === "code");

  return (
    <section className="checkout-shell auth-shell">
      <button className="back-link" type="button" onClick={onBack}>
        <ArrowLeft size={18} /> {text.backCatalog}
      </button>
      <section className="access-card">
        <div className="section-title">
          <UserRound size={22} />
          <h1>{title}</h1>
        </div>
        <p>{description}</p>

        <div className={mode === "forgot" || mode === "password" ? "access-tabs hidden" : "access-tabs"}>
          <button className={mode === "register" ? "active" : ""} type="button" onClick={() => changeMode("register")}>
            <UserPlus size={17} /> {text.register}
          </button>
          <button className={mode === "login" ? "active" : ""} type="button" onClick={() => changeMode("login")}>
            <LogIn size={17} /> {text.login}
          </button>
        </div>

        <form className="access-form" onSubmit={submit}>
          {mode === "register" ? (
            <label>
              <span>{text.name}</span>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder={text.buyerName} />
            </label>
          ) : null}
          <label>
            <span>Email</span>
            <input type="email" value={contact} onChange={(event) => setContact(event.target.value)} placeholder="email@domain.com" />
          </label>
          {step === "code" ? (
            <label>
              <span>{text.verificationCode}</span>
              <input inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value)} placeholder={text.codePlaceholder} />
            </label>
          ) : null}
          {showPasswordInput ? (
            <label>
              <span>{(mode === "forgot" || mode === "password") && step === "code" ? text.newPassword : text.password}</span>
              <div className="password-field">
                <input
                  ref={passwordInputRef}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={text.passwordPlaceholder}
                />
                <button
                  type="button"
                  onPointerDown={(event) => togglePasswordVisibility(event, passwordInputRef, setShowPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </label>
          ) : null}
          {message ? <div className="auth-note success"><Mail size={18} /> {message}</div> : null}
          {error ? <div className="auth-note error"><KeyRound size={18} /> {error}</div> : null}
          <button className="primary-action" disabled={!canSubmit}>
            {loading ? <Loader2 className="spin" size={18} /> : mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
            {loading ? text.processing : buttonText}
          </button>
          {mode === "login" ? (
            <button className="text-action" type="button" onClick={() => changeMode("forgot")}>
              {text.forgotPassword}
            </button>
          ) : null}
          {mode === "forgot" || mode === "password" ? (
            <button className="text-action" type="button" onClick={() => changeMode("login")}>
              {text.backLogin}
            </button>
          ) : null}
        </form>
      </section>
      <SiteFooter language={language} storeInfo={storeInfo} onNavigate={onNavigate} />
    </section>
  );
}

function CheckoutPanel({ product, access, language = "id", onBack, onLogin, onPayment, onNavigate }) {
  const text = getText(language);
  const { variants } = productStats(product);
  const availableVariants = variants.filter((item) => Number(item.stock || 0) > 0);
  const [variantName, setVariantName] = useState(availableVariants[0]?.name || variants[0]?.name || "");
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState(access?.customer?.email || access?.customer?.contact || "");
  const [emailTouched, setEmailTouched] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [showRegisterOffer, setShowRegisterOffer] = useState(false);
  const [registeredBlock, setRegisteredBlock] = useState(null);
  const [guestConfirmed, setGuestConfirmed] = useState(Boolean(access?.customer));
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const variant = variants.find((item) => item.name === variantName) || variants[0];
  const stock = Number(variant?.stock || 0);
  const safeQuantity = Math.min(Math.max(Number(quantity) || 1, 1), Math.max(stock, 1));
  const emailReady = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
  const emailText = String(email || "").trim();
  const emailError = emailTouched && !emailReady
    ? (emailText ? text.invalidEmail : text.emailRequired)
    : "";
  const subtotal = Number(variant?.price || 0) * safeQuantity;
  const verificationReady = Boolean(turnstileToken);
  const canPay = product && variant && emailReady && verificationReady && stock > 0 && safeQuantity <= stock;

  const updateQuantity = (next) => {
    setQuantity(Math.min(Math.max(Number(next) || 1, 1), Math.max(stock, 1)));
  };

  const processCheckout = async ({ asGuest = false } = {}) => {
    if (!emailReady) {
      setEmailTouched(true);
      setCheckoutError(text.invalidEmail);
      return;
    }
    if (!canPay || loading) return;
    if (!access?.customer && !guestConfirmed && !asGuest) {
      setShowRegisterOffer(true);
      return;
    }

    const buyerEmail = normalizeEmail(email);
    setLoading(true);
    setCheckoutError("");
    try {
      let customer = access?.customer || null;
      let saveHistory = Boolean(access?.customer);

      if (!customer) {
        const existingUser = getWebUser(buyerEmail);
        if (existingUser) {
          setRegisteredBlock({
            email: buyerEmail,
            hasPassword: webUserHasPassword(existingUser),
          });
          setShowRegisterOffer(false);
          return;
        }

        customer = createGuestCheckoutCustomer(buyerEmail, {
          name: buyerEmail.split("@")[0] || buyerEmail,
          whatsapp: whatsapp.trim(),
        });
        saveHistory = true;
      }

      const order = await createCheckout({
        product_code: product.code,
        product_id: product.id,
        variant_name: variant.name,
        qty: safeQuantity,
        buyer_name: customer.name || buyerEmail,
        email: buyerEmail,
        whatsapp: whatsapp.trim(),
        contact: whatsapp.trim() || buyerEmail,
        total_amount: subtotal,
        source: "web",
        save_history: saveHistory,
        account_id: saveHistory ? customer.id : "",
        turnstile_token: turnstileToken,
        verification_provider: TURNSTILE_SITE_KEY ? "cloudflare_turnstile" : "demo",
      });
      const nextOrder = {
        ...order,
        product,
        variant,
        qty: safeQuantity,
        amount: order.amount ?? subtotal,
        total_amount: order.total_amount ?? order.amount ?? subtotal,
        buyerName: customer.name || buyerEmail,
        email: buyerEmail,
        contact: whatsapp.trim() || buyerEmail,
        access: saveHistory
          ? { type: "account", customer, saveHistory: true, autoCreated: !access?.customer }
          : { type: "guest", customer, saveHistory: false },
      };
      saveDemoOrder(nextOrder);
      onPayment(nextOrder);
    } catch (err) {
      if (err.code === "EMAIL_REQUIRES_LOGIN" || err.code === "EMAIL_NEEDS_PASSWORD_SETUP") {
        setRegisteredBlock({
          email: buyerEmail,
          hasPassword: err.code === "EMAIL_REQUIRES_LOGIN",
        });
        setShowRegisterOffer(false);
        return;
      }
      setCheckoutError(err.message || text.checkoutFailed);
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    await processCheckout();
  };

  return (
    <main className="checkout-shell checkout-compact">
      <button className="back-link" type="button" onClick={onBack}>
        <ArrowLeft size={18} /> {text.backCatalog}
      </button>
      <section className="checkout-grid">
        <div className="checkout-left">
          <div className="detail-panel">
            <ProductVisual product={product} />
            <span className="category-pill">{guessCategory(product)}</span>
            <h1>{product.name}</h1>
            <p>{product.desc || text.productReady}</p>
            <div className="trust-row">
              <span><ShieldCheck size={16} /> {text.warranty}</span>
              <span><BadgeCheck size={16} /> {text.stockRealtime}</span>
            </div>
            <div className="product-detail-strip">
              <span>
                <small>{text.productMetaStock}</small>
                <strong>{stock}</strong>
              </span>
              <span>
                <small>{text.productMetaProcess}</small>
                <strong>{text.productMetaProcessValue}</strong>
              </span>
              <span>
                <small>{text.productMetaPayment}</small>
                <strong>QRIS</strong>
              </span>
            </div>
          </div>
          <BuyerReviewsPanel />
        </div>

        <form className="checkout-card" onSubmit={submit}>
          <div className="section-title">
            <ShoppingBag size={20} />
            <h2>{text.checkout}</h2>
          </div>

          <div className="quantity-block">
            <span>{text.quantity}</span>
            <div className="qty-stepper">
              <button type="button" onClick={() => updateQuantity(safeQuantity - 1)} disabled={safeQuantity <= 1}>-</button>
              <strong>{safeQuantity}</strong>
              <button type="button" onClick={() => updateQuantity(safeQuantity + 1)} disabled={safeQuantity >= stock}>+</button>
            </div>
          </div>

          <label>
            <span>{text.variant}</span>
            <select value={variantName} onChange={(event) => setVariantName(event.target.value)}>
              {variants.map((item) => (
                <option key={item.name} value={item.name} disabled={Number(item.stock || 0) < 1}>
                  {item.name} - {rupiah(item.price)}
                </option>
              ))}
            </select>
          </label>

          <div className="buyer-box">
            <h3>{text.buyerData}</h3>
            <label>
              <span>Email</span>
              <input
                type="email"
                value={email}
                onBlur={() => setEmailTouched(true)}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailTouched(true);
                  if (checkoutError === text.invalidEmail || checkoutError === text.emailRequired) setCheckoutError("");
                }}
                aria-invalid={Boolean(emailError)}
                placeholder="kamu@email.com"
              />
              {emailError ? <small className="field-error">{emailError}</small> : null}
            </label>
            <label>
              <span>{text.whatsappOptional}</span>
              <input value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="0812xxxxxxxx" />
            </label>
            <TurnstileBox siteKey={TURNSTILE_SITE_KEY} onTokenChange={setTurnstileToken} />
            <p>
              {text.checkoutEmailNote}
              {" "}{text.haveAccount} <button type="button" onClick={() => onLogin("login")}>{text.login}</button>
            </p>
          </div>

          <div className="summary-box">
            <div>
              <span>{text.subtotal}</span>
              <strong>{rupiah(subtotal)}</strong>
            </div>
            <div>
              <span>{text.uniqueCode}</span>
              <strong>{rupiah(0)}</strong>
            </div>
            <div>
              <span>{text.total}</span>
              <strong>{rupiah(subtotal)}</strong>
            </div>
          </div>

          <button className="primary-action" disabled={!canPay || loading}>
            {loading ? <Loader2 className="spin" size={18} /> : <CreditCard size={18} />}
            {text.continuePayment}
          </button>
          {checkoutError ? <p className="checkout-alert">{checkoutError}</p> : null}
          <small className="checkout-hint">{text.checkoutHint}</small>
        </form>
      </section>

      {showRegisterOffer ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Daftar akun">
          <div className="register-offer">
            <button className="modal-close" type="button" onClick={() => setShowRegisterOffer(false)}>
              <X size={17} />
            </button>
            <div className="section-label">{text.accountOffer}</div>
            <h2>{text.registerFirst}</h2>
            <p>{text.registerOfferDesc}</p>
            <div className="modal-actions">
              <button type="button" onClick={() => onLogin("register")}>
                <UserPlus size={18} /> {text.register} / {text.login}
              </button>
              <button
                className="ghost"
                type="button"
                onClick={() => {
                  setGuestConfirmed(true);
                  setShowRegisterOffer(false);
                  processCheckout({ asGuest: true });
                }}
              >
                {text.continueGuest}
              </button>
            </div>
            <small>{text.sensitiveSafe}</small>
          </div>
        </div>
      ) : null}

      {registeredBlock ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={text.emailAlreadyUsedTitle}>
          <div className="register-offer registered-block">
            <button className="modal-close" type="button" onClick={() => setRegisteredBlock(null)}>
              <X size={17} />
            </button>
            <div className="section-label">{text.accountOffer}</div>
            <h2>{text.emailAlreadyUsedTitle}</h2>
            <p>
              {registeredBlock.hasPassword ? text.emailRegisteredLogin : text.emailNeedsPassword}
              <br />
              <strong>{registeredBlock.email}</strong>
            </p>
            <div className="modal-actions">
              <button type="button" onClick={() => onLogin("login", registeredBlock.email)}>
                <LogIn size={18} /> {text.login}
              </button>
              <button type="button" onClick={() => onLogin("password", registeredBlock.email)}>
                <KeyRound size={18} /> {text.passwordSetupCta}
              </button>
              <button
                className="ghost"
                type="button"
                onClick={() => {
                  setRegisteredBlock(null);
                  setGuestConfirmed(false);
                  setEmail("");
                }}
              >
                {text.useAnotherEmail}
              </button>
            </div>
            <small>{text.emailAlreadyUsedDesc}</small>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function PaymentPanel({ order, language = "id", storeInfo = {}, onBack, onNavigate, onPaid, onOpenOrder }) {
  const text = getText(language);
  const storeBrand = getStoreDisplayName(storeInfo);
  const initialStatus = String(order.status || "").toLowerCase();
  const initialExpired = Boolean(order.expires_at && Number(order.expires_at) <= Date.now());
  const [paymentStatus, setPaymentStatus] = useState(
    ["paid", "success", "completed"].includes(initialStatus)
      ? "paid"
      : (initialStatus === "expired" || initialExpired ? "expired" : "pending")
  );
  const [paidOrder, setPaidOrder] = useState(() => (["paid", "success", "completed"].includes(initialStatus) ? order : null));
  const [redirectCount, setRedirectCount] = useState(null);
  const [statusNotice, setStatusNotice] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const refreshLockRef = useRef(false);
  const qrisUrl = order.qris_image_url || (API_BASE_URL && order.reference_id ? `${API_BASE_URL}/api/web/orders/${order.reference_id}/qris.png` : "");
  const subtotalAmount = getOrderSubtotal(order);
  const payableAmount = getOrderPayableAmount(order);
  const uniqueCode = getOrderUniqueCode(order);
  const needsPasswordSetup = paymentStatus === "paid" && order.access?.customer && !accountHasPassword(order.access.customer);
  const expired = paymentStatus === "expired";
  const rawCreatedAt = Number(order.created_at || order.createdAt || Date.now());
  const createdAtMs = rawCreatedAt && rawCreatedAt < 1_000_000_000_000 ? rawCreatedAt * 1000 : rawCreatedAt;
  const createdAt = new Date(createdAtMs || Date.now()).toLocaleString(
    language === "id" ? "id-ID" : "en-US",
    { dateStyle: "medium", timeStyle: "short" }
  );
  const openPaidOrder = () => {
    if (!paidOrder) return;
    onOpenOrder?.(paidOrder);
  };

  useEffect(() => {
    if (paymentStatus !== "paid" || redirectCount === null) return undefined;
    if (redirectCount <= 0) {
      openPaidOrder();
      return undefined;
    }
    const timer = window.setTimeout(() => setRedirectCount((count) => Math.max(Number(count || 0) - 1, 0)), 1000);
    return () => window.clearTimeout(timer);
  }, [paymentStatus, redirectCount, paidOrder]);

  const handlePaidOrder = (nextOrder) => {
    const paid = {
      ...nextOrder,
      status: "paid",
      paid_at: nextOrder.paid_at || Date.now(),
    };
    savePaidOrderToHistory(paid);
    setPaidOrder(paid);
    onPaid?.(paid);
    setPaymentStatus("paid");
    setStatusNotice(text.paymentSuccessNotice);
    setRedirectCount(3);
  };

  const refreshPaymentStatus = async ({ silent = false } = {}) => {
    if (paymentStatus === "expired") {
      onBack?.();
      return;
    }
    if (paymentStatus === "paid") {
      openPaidOrder();
      return;
    }

    if (API_BASE_URL && order.reference_id && !isDemoReference(order.reference_id)) {
      if (refreshLockRef.current) return;
      refreshLockRef.current = true;
      if (!silent) {
        setRefreshing(true);
        setStatusNotice("");
      }
      try {
        const refreshed = await refreshOrderStatus(order.reference_id);
        const nextOrder = prepareOrderForPayment(
          { ...order, ...refreshed, access: order.access },
          order.access?.customer || null
        );
        const status = String(nextOrder.status || "").toLowerCase();
        if (["paid", "success", "completed"].includes(status)) {
          handlePaidOrder(nextOrder);
        } else if (status === "expired" || Number(nextOrder.expires_at || 0) <= Date.now()) {
          setPaymentStatus("expired");
          saveDemoOrder({ ...nextOrder, status: "expired" });
        } else {
          if (!silent) setStatusNotice(text.txFoundPending);
          saveDemoOrder(nextOrder);
        }
      } catch (err) {
        if (silent) console.warn("Auto refresh payment status failed:", err.message || err);
        else setStatusNotice(err.message || text.checkoutFailed);
      } finally {
        refreshLockRef.current = false;
        if (!silent) setRefreshing(false);
      }
      return;
    }

    handlePaidOrder(order);
  };

  const expirePayment = () => {
    if (paymentStatus !== "pending") return;
    setPaymentStatus("expired");
    setStatusNotice("");
    saveDemoOrder({ ...order, status: "expired" });
  };

  useEffect(() => {
    if (paymentStatus !== "pending" || expired || !order.reference_id) return undefined;
    if (!API_BASE_URL || isDemoReference(order.reference_id)) return undefined;
    const timer = window.setInterval(() => {
      refreshPaymentStatus({ silent: true });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paymentStatus, expired, order.reference_id, order.expires_at]);

  return (
    <main className="payment-shell">
      <button className="back-link" type="button" onClick={onBack}>
        <ArrowLeft size={18} /> Checkout
      </button>

      <section className="payment-card">
        <div className="payment-store-head">
          <div className="payment-merchant">
            <BrandIcon />
            <div>
              <strong>{storeBrand}</strong>
              <span>Merchant</span>
            </div>
          </div>
          <strong>{rupiah(payableAmount)}</strong>
        </div>

        <div className="payment-status-line">
          <span className="eyebrow">{paymentStatus === "paid" ? text.paymentSuccess : expired ? text.paymentExpired : text.waitingPayment}</span>
          {statusNotice ? <strong>{statusNotice}</strong> : null}
        </div>

        <div className="payment-body">
          <div className="payment-qris-panel">
            {expired ? (
              <div className="payment-expired-state">
                <PaymentExpiredIcon />
                <span>{text.paymentExpired}</span>
                <strong>{rupiah(payableAmount)}</strong>
                <p>{text.paymentExpiredDesc}</p>
                <code>{order.reference_id}</code>
              </div>
            ) : (
              <>
                <div className="qris-box">
                  {qrisUrl ? (
                    <img src={qrisUrl} alt={`QRIS ${order.reference_id}`} />
                  ) : (
                    <div className="qris-placeholder">
                      <CreditCard size={42} />
                      <span>QRIS Demo</span>
                    </div>
                  )}
                </div>
                <strong className="pay-countdown">{text.payWithin} <Countdown expiresAt={order.expires_at} onExpire={expirePayment} /></strong>
                <div className="payment-steps">
                  <strong>{text.paymentHowTitle}</strong>
                  <ol>
                    <li><span>01</span>{text.paymentHowOpen}</li>
                    <li><span>02</span>{text.paymentHowScan}</li>
                    <li><span>03</span>{text.paymentHowCheck}</li>
                  </ol>
                </div>
              </>
            )}
          </div>

          <div className="payment-info-panel">
            <div className="payment-section">
              <h3><CreditCard size={15} /> {text.paymentDetails}</h3>
              <div className="order-lines">
                <span>Reference</span>
                <strong>{order.reference_id}</strong>
                <span>{text.merchantRef}</span>
                <strong>{order.reference_id}</strong>
                <span>{text.method}</span>
                <strong>QRIS</strong>
                <span>{text.createdAt}</span>
                <strong>{createdAt}</strong>
              </div>
            </div>

            <div className="payment-section">
              <h3><ShoppingBag size={15} /> {text.summary}</h3>
              <div className="summary-lines">
                <span>{text.product}</span>
                <strong>{order.product?.name}</strong>
                <span>{text.variant}</span>
                <strong>{order.variant?.name}</strong>
                <span>{text.qty}</span>
                <strong>{order.qty || 1}</strong>
                <span>{text.subtotal}</span>
                <strong>{rupiah(subtotalAmount)}</strong>
                <span>{text.uniqueCode}</span>
                <strong>{rupiah(uniqueCode)}</strong>
                <b>{text.total}</b>
                <b>{rupiah(payableAmount)}</b>
              </div>
            </div>

            {needsPasswordSetup ? (
              <div className="status-password-warning payment-password-warning">
                <KeyRound size={18} />
                <span>{text.passwordSetupWarning}</span>
              </div>
            ) : null}

            {paymentStatus === "paid" && redirectCount !== null ? (
              <div className="payment-redirect-note">
                <CheckCircle2 size={18} />
                <span>{text.paymentRedirectPrefix} <strong>{redirectCount}</strong> {text.paymentRedirectSuffix}</span>
              </div>
            ) : null}

            <button className="payment-refresh" type="button" onClick={refreshPaymentStatus} disabled={refreshing}>
              {refreshing ? text.checkingStatus : paymentStatus === "paid" ? text.myOrders : expired ? text.createNewOrder : text.refreshStatus}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function SiteFooter({ language = "id", storeInfo = {}, onNavigate = null }) {
  const text = getText(language);
  const year = new Date().getFullYear();
  const storeBrand = getStoreDisplayName(storeInfo);
  const navigate = (page) => {
    if (onNavigate) {
      onNavigate(page);
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="site-footer">
      <div className="receipt-footer">
        <div className="receipt-head">
          <div>
            <span className="receipt-kicker">{text.footerReceipt}</span>
            <h2><BrandText brand={storeBrand} className="footer-brand-title" dot /></h2>
          </div>
          <div className="receipt-code">DIGITAL PRODUCT</div>
        </div>

        <div className="receipt-grid">
          <div className="receipt-block">
            <h3>{text.footerStore}</h3>
            <p>{text.footerStoreDesc}</p>
          </div>
          <div className="receipt-block">
            <h3>{text.footerSupport}</h3>
            <span>Email: support@warungxit.store</span>
            <a className="receipt-text-button" href="https://t.me/warungxit" target="_blank" rel="noreferrer">
              Telegram: @warungxit
            </a>
          </div>
          <div className="receipt-block">
            <h3>{text.footerSystem}</h3>
            <span>{text.payment}: QRIS</span>
            <span>{text.delivery}: Email</span>
            <span>Status: 24/7 Auto</span>
          </div>
          <nav className="receipt-menu" aria-label="Menu footer">
            <button type="button" onClick={() => navigate("home")}>{text.home}</button>
            <button type="button" onClick={() => navigate("products")}>{text.products}</button>
            <button type="button" onClick={() => navigate("howto")}>{text.howto}</button>
            <button type="button" onClick={() => navigate("check")}>{text.status}</button>
          </nav>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {year} {storeBrand}. All Rights Reserved.</span>
        <span>{text.author} : {STORE_AUTHOR}</span>
      </div>
    </footer>
  );
}

function HowToOrderSection({ language = "id" }) {
  const text = getText(language);
  return (
    <section className="home-order-section" id="order-guide">
      <div className="guide-panel page-panel">
        <div className="section-label">{text.howto}</div>
        <h2>{text.orderFlowTitle}</h2>
        <div className="guide-steps">
          <article>
            <span>01</span>
            <h3>{text.orderFlow1Title}</h3>
            <p>{text.orderFlow1Desc}</p>
          </article>
          <article>
            <span>02</span>
            <h3>{text.orderFlow2Title}</h3>
            <p>{text.orderFlow2Desc}</p>
          </article>
          <article>
            <span>03</span>
            <h3>{text.orderFlow3Title}</h3>
            <p>{text.orderFlow3Desc}</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function OrderAccountDetailModal({ order, language = "id", onClose }) {
  const text = getText(language);
  const realAccounts = Array.isArray(order.accountDetails) ? order.accountDetails : [];
  const fallbackDetail = buildOrderAccountDetail(order);
  const accounts = realAccounts.length
    ? realAccounts.map((account, index) => ({
        username: account.username || account.email || account.login || "-",
        password: account.password || account.pass || "-",
        label: account.label || `Akun ${index + 1}`,
        note: account.note || account.snk || "",
      }))
    : [{ ...fallbackDetail, label: "Akun 1" }];
  const isRealDetail = realAccounts.length > 0;
  const accountNote = accounts
    .map((account) => String(account.note || "").trim())
    .filter(Boolean)
    .join("\n\n");
  const orderDate = formatOrderTimestamp(order, language);
  const [copied, setCopied] = useState("");

  const copyValue = async (label, value) => {
    try {
      await navigator.clipboard.writeText(String(value || ""));
      setCopied(label);
      window.setTimeout(() => setCopied(""), 1300);
    } catch {
      setCopied("");
    }
  };

  return (
    <div className="modal-backdrop account-detail-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="account-detail-modal" role="dialog" aria-modal="true" aria-labelledby="account-detail-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label={text.close}>
          <X size={18} />
        </button>
        <div className="account-detail-title">
          <KeyRound size={24} />
          <div>
            <h2 id="account-detail-title">{text.accountDetailTitle}</h2>
            <p>{text.accountDetailDesc}</p>
          </div>
        </div>

        <div className="account-detail-order">
          <span>{order.reference_id}</span>
          <strong>{order.productName}</strong>
          <small>{order.variantName} - {order.qty}x</small>
          <small>{text.createdAt}: {orderDate}</small>
        </div>

        {order.accountDetailLoading ? (
          <div className="credential-state">
            <Loader2 size={20} className="spin" />
            <strong>{text.accountRevealLoading}</strong>
          </div>
        ) : order.accountDetailError ? (
          <div className="credential-state error">
            <X size={20} />
            <strong>{order.accountDetailError || text.accountRevealFailed}</strong>
          </div>
        ) : (
          <div className="credential-grid">
            {accounts.map((detail, index) => (
              <div className="credential-account" key={`${detail.username}-${index}`}>
                {accounts.length > 1 ? <strong className="credential-account-title">{detail.label}</strong> : null}
                <label>
                  <span>{text.accountLogin}</span>
                  <div className="credential-value">
                    <code>{detail.username}</code>
                    <button type="button" onClick={() => copyValue(`login-${index}`, detail.username)}>
                      <Copy size={15} /> {copied === `login-${index}` ? text.copiedText : text.copyText}
                    </button>
                  </div>
                </label>
                <label>
                  <span>{text.accountPassword}</span>
                  <div className="credential-value">
                    <code>{detail.password}</code>
                    <button type="button" onClick={() => copyValue(`password-${index}`, detail.password)}>
                      <Copy size={15} /> {copied === `password-${index}` ? text.copiedText : text.copyText}
                    </button>
                  </div>
                </label>
              </div>
            ))}
          </div>
        )}

        <div className="credential-note">
          <BadgeCheck size={18} />
          <div>
            <strong>{text.accountNote}</strong>
            <span>{accountNote || (isRealDetail ? text.accountRealNote : (fallbackDetail.note || text.accountDemoNote))}</span>
            <small>{text.credentialRetentionNote}</small>
          </div>
        </div>
      </section>
    </div>
  );
}

function OrderSummaryModal({ order, language = "id", onClose }) {
  const text = getText(language);
  const amount = getOrderPayableAmount(order);
  const rawCreatedAt = Number(order.created_at || order.createdAt || Date.now());
  const createdAtMs = rawCreatedAt && rawCreatedAt < 1_000_000_000_000 ? rawCreatedAt * 1000 : rawCreatedAt;
  const createdAt = new Date(createdAtMs || Date.now()).toLocaleString(
    language === "id" ? "id-ID" : "en-US",
    { dateStyle: "medium", timeStyle: "short" }
  );

  return (
    <div className="modal-backdrop account-detail-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="account-detail-modal order-summary-modal" role="dialog" aria-modal="true" aria-labelledby="order-summary-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label={text.close}>
          <X size={18} />
        </button>
        <div className="account-detail-title">
          <ShoppingBag size={24} />
          <div>
            <h2 id="order-summary-title">{text.orderSummaryTitle}</h2>
            <p>{text.orderSummaryDesc}</p>
          </div>
        </div>

        <div className="account-detail-order order-summary-highlight">
          <span>{order.reference_id}</span>
          <strong>{order.productName || order.product?.name || "-"}</strong>
          <small>{order.variantName || order.variant?.name || "-"} - {order.qty || 1}x</small>
        </div>

        <div className="order-summary-lines">
          <div>
            <span>{text.orderId}</span>
            <strong>{order.reference_id}</strong>
          </div>
          <div>
            <span>{text.merchantRef}</span>
            <strong>{order.reference_id}</strong>
          </div>
          <div>
            <span>{text.createdAt}</span>
            <strong>{createdAt}</strong>
          </div>
          <div>
            <span>{text.total}</span>
            <strong>{rupiah(amount)}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusOrderPage({ account, language = "id", focusedOrderRef = "", onFocusConsumed, onPayOrder }) {
  const text = getText(language);
  const [statusTab, setStatusTab] = useState("pending");
  const [trackingCode, setTrackingCode] = useState("");
  const [statusSearchMessage, setStatusSearchMessage] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);
  const [summaryOrder, setSummaryOrder] = useState(null);
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [statusPage, setStatusPage] = useState(1);
  const history = useMemo(() => loadOrderHistory(account), [account]);
  const needsPasswordSetup = shouldShowPasswordSetupReminder(account);
  const accountEmail = normalizeEmail(account?.email || account?.contact || "");
  const demoOrders = loadDemoOrders()
    .filter((order) => !accountEmail || normalizeEmail(order.email) === accountEmail)
    .map((order) => {
      const status = String(order.status || "").toLowerCase();
      const expired = order.expires_at && Number(order.expires_at) <= Date.now() && !["paid", "success", "completed"].includes(status);
      return expired ? { ...order, status: "expired" } : order;
    });
  const orderBucket = (order) => {
    const status = String(order?.status || "").toLowerCase();
    if (["paid", "success", "completed"].includes(status)) return "done";
    if (status === "expired" || status === "canceled" || status === "cancelled") return "canceled";
    return "pending";
  };
  const uniqueOrders = (orders = []) => {
    const seen = new Set();
    return orders.filter((order) => {
      const key = String(order?.reference_id || "").trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  const pendingOrders = uniqueOrders([
    ...demoOrders.filter((order) => orderBucket(order) === "pending"),
    ...(trackedOrder && orderBucket(trackedOrder) === "pending" ? [trackedOrder] : []),
  ]);
  const canceledOrders = uniqueOrders([
    ...demoOrders.filter((order) => orderBucket(order) === "canceled"),
    ...(trackedOrder && orderBucket(trackedOrder) === "canceled" ? [trackedOrder] : []),
  ]);
  const doneOrders = uniqueOrders([...history, ...(trackedOrder && orderBucket(trackedOrder) === "done" ? [trackedOrder] : [])]);
  const visibleOrders = {
    pending: pendingOrders,
    canceled: canceledOrders,
    done: doneOrders,
  }[statusTab] || [];
  const totalStatusPages = Math.max(1, Math.ceil(visibleOrders.length / STATUS_ORDER_PAGE_SIZE));
  const currentStatusPage = Math.min(Math.max(statusPage, 1), totalStatusPages);
  const pagedOrders = visibleOrders.slice(
    (currentStatusPage - 1) * STATUS_ORDER_PAGE_SIZE,
    currentStatusPage * STATUS_ORDER_PAGE_SIZE
  );
  const statusCounts = {
    pending: pendingOrders.length,
    canceled: canceledOrders.length,
    done: doneOrders.length,
  };
  const statusMeta = {
    pending: {
      title: text.pending,
      empty: text.pendingEmpty,
      icon: Timer,
      overview: text.statusOverviewPending,
    },
    canceled: {
      title: text.canceled,
      empty: text.canceledEmpty,
      icon: X,
      overview: text.statusOverviewCanceled,
    },
    done: {
      title: text.done,
      empty: text.doneEmpty,
      icon: CheckCircle2,
      overview: text.statusOverviewDone,
    },
  }[statusTab];
  const StatusIcon = statusMeta.icon;

  useEffect(() => {
    setStatusPage(1);
  }, [statusTab]);

  useEffect(() => {
    if (statusPage > totalStatusPages) setStatusPage(totalStatusPages);
  }, [statusPage, totalStatusPages]);

  const openAccountDetail = async (order) => {
    if (!order?.reference_id) return;
    const reference = String(order.reference_id);
    const shouldUseApi = Boolean(API_BASE_URL) && !isDemoReference(reference);

    setDetailOrder({
      ...order,
      accountDetailLoading: shouldUseApi,
      accountDetailError: "",
    });

    if (!shouldUseApi) return;

    try {
      const payload = await revealOrderAccounts(reference);
      const accounts = Array.isArray(payload?.accounts) ? payload.accounts : [];
      setDetailOrder((current) => {
        if (!current || String(current.reference_id) !== reference) return current;
        return {
          ...current,
          ...(payload?.order || {}),
          productName: payload?.order?.product?.name || current.productName,
          variantName: payload?.order?.variant?.name || current.variantName,
          accountDetails: accounts,
          accountDetailLoading: false,
          accountDetailError: "",
        };
      });
    } catch (err) {
      setDetailOrder((current) => {
        if (!current || String(current.reference_id) !== reference) return current;
        return {
          ...current,
          accountDetailLoading: false,
          accountDetailError: err?.message || text.accountRevealFailed,
        };
      });
    }
  };

  useEffect(() => {
    if (!focusedOrderRef) return;
    const targetOrder = history.find((order) => String(order.reference_id) === String(focusedOrderRef));
    if (!targetOrder) return;
    setStatusTab("done");
    openAccountDetail(targetOrder);
    onFocusConsumed?.();
  }, [focusedOrderRef, history, onFocusConsumed]);

  const checkTrackingCode = (event) => {
    event.preventDefault();
    const code = String(trackingCode || "").trim();
    if (!code) {
      setStatusSearchMessage({ type: "error", text: text.txRequired });
      return;
    }

    const order = findDemoOrder(code);
    if (!order) {
      setTrackedOrder(null);
      setStatusSearchMessage({ type: "error", text: text.txNotFound });
      return;
    }

    const orderStatus = String(order.status || "").toLowerCase();
    const isExpired = orderStatus === "expired" || (order.expires_at && Number(order.expires_at) <= Date.now() && !["paid", "success", "completed"].includes(orderStatus));
    if (["paid", "success", "completed"].includes(orderStatus)) {
      setTrackedOrder(order);
      setStatusTab("done");
      openAccountDetail(order);
      setStatusSearchMessage({ type: "success", text: text.txFoundDone });
      return;
    }
    if (isExpired) {
      const expiredOrder = saveDemoOrder({ ...order, status: "expired" });
      setTrackedOrder(expiredOrder);
      setStatusTab("canceled");
      setStatusSearchMessage({ type: "error", text: text.txFoundExpired });
      return;
    }
    setTrackedOrder(order);
    setStatusTab("pending");
    setStatusSearchMessage({ type: "info", text: text.txFoundPending });
  };

  const renderOrderAction = (order) => {
    const bucket = orderBucket(order);
    if (bucket === "done") {
      return (
        <button type="button" onClick={() => openAccountDetail(order)}>
          <Eye size={15} /> {text.viewAccountDetail}
        </button>
      );
    }
    if (bucket === "canceled") {
      return (
        <button type="button" onClick={() => setSummaryOrder(order)}>
          <ShoppingBag size={15} /> {text.viewSummary}
        </button>
      );
    }
    return (
      <button type="button" onClick={() => onPayOrder?.(order)}>
        <CreditCard size={15} /> {text.payNow}
      </button>
    );
  };
  const getOrderStatusLabel = (order) => {
    const status = String(order?.status || "").toLowerCase();
    if (status === "expired") return text.expired;
    if (status === "canceled" || status === "cancelled") return text.canceled;
    const bucket = orderBucket(order);
    if (bucket === "done") return text.done;
    return text.pending;
  };

  return (
    <section className="single-page-section">
      <div className="status-order-panel page-panel">
        <div className="status-intro">
          <div>
            <div className="section-label">{text.status}</div>
            <h2>{text.statusTitle}</h2>
            <p>{text.statusDesc}</p>
          </div>
          <div className="status-overview">
            {["pending", "canceled", "done"].map((key) => {
              const item = {
                pending: { label: text.statusOverviewPending, value: statusCounts.pending, Icon: Timer },
                canceled: { label: text.statusOverviewCanceled, value: statusCounts.canceled, Icon: X },
                done: { label: text.statusOverviewDone, value: statusCounts.done, Icon: CheckCircle2 },
              }[key];
              return (
                <button
                  key={key}
                  className={statusTab === key ? "active" : ""}
                  type="button"
                  onClick={() => setStatusTab(key)}
                >
                  <item.Icon size={18} />
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {needsPasswordSetup ? (
          <div className="status-password-warning">
            <KeyRound size={18} />
            <span>{text.passwordSetupWarning}</span>
          </div>
        ) : null}

        <form className="tracker-form status-search" onSubmit={checkTrackingCode}>
          <label>
            <span>{text.txCode}</span>
            <input value={trackingCode} onChange={(event) => setTrackingCode(event.target.value)} placeholder={text.txPlaceholder} />
            <small>{text.statusSearchNote}</small>
          </label>
          <button type="submit">
            <Search size={18} /> {text.checkStatus}
          </button>
        </form>
        {statusSearchMessage ? (
          <div className={`status-search-message ${statusSearchMessage.type}`}>
            {statusSearchMessage.type === "success" ? <CheckCircle2 size={17} /> : statusSearchMessage.type === "info" ? <Timer size={17} /> : <X size={17} />}
            <span>{statusSearchMessage.text}</span>
          </div>
        ) : null}

        <div className="status-tabs" role="tablist" aria-label="Status pesanan">
          <button className={statusTab === "pending" ? "active" : ""} type="button" onClick={() => setStatusTab("pending")}>
            <Timer size={17} /> {text.pending}
          </button>
          <button className={statusTab === "canceled" ? "active" : ""} type="button" onClick={() => setStatusTab("canceled")}>
            <X size={17} /> {text.canceled}
          </button>
          <button className={statusTab === "done" ? "active" : ""} type="button" onClick={() => setStatusTab("done")}>
            <CheckCircle2 size={17} /> {text.done}
          </button>
        </div>

        <div className={`history-panel status-list-panel status-panel-${statusTab}`}>
          <div className="status-side">
            <div className="section-label">{statusMeta.title}</div>
            <StatusIcon size={34} />
            <h2>{statusMeta.title}</h2>
            <strong>{statusCounts[statusTab]}</strong>
            <span>{statusMeta.overview}</span>
            <p>{text.credentialSafe}</p>
          </div>

          {visibleOrders.length ? (
          <div className="history-list">
            {pagedOrders.map((order) => (
              <article key={order.reference_id}>
                <div>
                  <strong>{order.productName}</strong>
                  <span>{order.variantName} - {order.qty}x</span>
                  <small className="history-order-date">{text.createdAt}: {formatOrderTimestamp(order, language)}</small>
                  <small className={`history-order-status history-order-status-${orderBucket(order)}`}>
                    {getOrderStatusLabel(order)}
                  </small>
                </div>
                <div className="history-order-meta">
                  <strong>{rupiah(getOrderPayableAmount(order))}</strong>
                  <span>{order.reference_id}</span>
                  {renderOrderAction(order)}
                </div>
              </article>
            ))}
            {visibleOrders.length > STATUS_ORDER_PAGE_SIZE ? (
              <div className="history-pagination">
                <button
                  type="button"
                  disabled={currentStatusPage <= 1}
                  onClick={() => setStatusPage((page) => Math.max(1, page - 1))}
                >
                  <ChevronLeft size={15} /> {language === "id" ? "Sebelumnya" : "Previous"}
                </button>
                <strong>{currentStatusPage}/{totalStatusPages}</strong>
                <button
                  type="button"
                  disabled={currentStatusPage >= totalStatusPages}
                  onClick={() => setStatusPage((page) => Math.min(totalStatusPages, page + 1))}
                >
                  {language === "id" ? "Selanjutnya" : "Next"} <ChevronRight size={15} />
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="history-empty">
            <ShoppingBag size={24} />
            <strong>{statusMeta.empty}</strong>
            <span>{text.dataWillShow}</span>
          </div>
        )}
        </div>
        {detailOrder ? (
          <OrderAccountDetailModal order={detailOrder} language={language} onClose={() => setDetailOrder(null)} />
        ) : null}
        {summaryOrder ? (
          <OrderSummaryModal order={summaryOrder} language={language} onClose={() => setSummaryOrder(null)} />
        ) : null}
      </div>
    </section>
  );
}

function ProfilePage({ account, language = "id", onAccountUpdate, onOrders, onShop }) {
  const text = getText(language);
  const accountName = getAccountDisplayName(account);
  const accountEmail = getAccountEmail(account);
  const history = useMemo(() => loadOrderHistory(account), [account]);
  const totalSpent = history.reduce((sum, order) => sum + getOrderPayableAmount(order), 0);
  const [name, setName] = useState(String(account?.name || accountName || "").trim());
  const [email, setEmail] = useState(accountEmail);
  const [whatsapp, setWhatsapp] = useState(String(account?.whatsapp || "").trim());
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const newPasswordRef = useRef(null);
  const repeatPasswordRef = useRef(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileNotice, setProfileNotice] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const needsPasswordSetup = !accountHasPassword(account);

  useEffect(() => {
    setName(String(account?.name || getAccountDisplayName(account) || "").trim());
    setEmail(getAccountEmail(account));
    setWhatsapp(String(account?.whatsapp || "").trim());
  }, [account]);

  const saveProfile = (event) => {
    event.preventDefault();
    const normalizedEmail = normalizeEmail(email);
    const next = saveWebCustomerProfile({
      ...account,
      name: name.trim() || getAccountDisplayName(account),
      email: normalizedEmail,
      contact: normalizedEmail,
      whatsapp: whatsapp.trim(),
    }, accountEmail);
    onAccountUpdate?.(next);
    setProfileNotice(text.profileSaved);
  };

  const savePassword = async (event) => {
    event.preventDefault();
    if (passwordLoading) return;
    setPasswordNotice("");
    if (newPassword.trim().length < 6) {
      setPasswordNotice(text.passwordTooShort);
      return;
    }
    if (newPassword !== repeatPassword) {
      setPasswordNotice(text.passwordMismatch);
      return;
    }
    if (!turnstileToken) return;

    setPasswordLoading(true);
    try {
      const nextAccount = await saveWebCustomerPassword(account, newPassword);
      onAccountUpdate?.(nextAccount);
      setNewPassword("");
      setRepeatPassword("");
      setPasswordNotice(text.passwordSetupDone);
    } catch (err) {
      setPasswordNotice(err.message || text.checkoutFailed);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <section className="single-page-section">
      <div className="profile-panel page-panel">
        <div className="profile-greeting">
          <div>
            <h1>{text.profileGreeting}, {accountName} <span aria-hidden="true">✨</span></h1>
            <p>{text.profileWelcome}</p>
          </div>
          <span className="account-avatar large">{accountName.slice(0, 1).toUpperCase()}</span>
        </div>

        <div className="profile-actions">
          <button type="button" onClick={onOrders}>
            <ShoppingBag size={18} /> {text.myOrders}
          </button>
          <button className="dark" type="button" onClick={onShop}>
            <Sparkles size={18} /> {text.shopAgain}
          </button>
        </div>

        {needsPasswordSetup ? (
          <div className="profile-warning">
            <KeyRound size={20} />
            <div>
              <strong>{text.passwordSetupTitle}</strong>
              <p>{text.passwordSetupWarning}</p>
            </div>
          </div>
        ) : null}

        <div className="profile-stat-grid">
          <article>
            <span>{text.totalOrders}</span>
            <strong>{history.length}</strong>
          </article>
          <article>
            <span>{text.completedOrders}</span>
            <strong>{history.length}</strong>
          </article>
          <article>
            <span>{text.totalSpent}</span>
            <strong>{rupiah(totalSpent)}</strong>
          </article>
        </div>

        <form className="profile-card profile-form-card" onSubmit={saveProfile}>
          <h2>{text.profileFormTitle}</h2>
          <label>
            <span>{text.name}</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder={text.buyerName} />
          </label>
          <label>
            <span>{text.email}</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@domain.com" />
          </label>
          <label>
            <span>{text.whatsappOptional}</span>
            <input value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="0812xxxxxxxx" />
            <small>{text.whatsappHelp}</small>
          </label>
          <button className="profile-submit" type="submit">
            <Save size={18} /> {text.saveProfile}
          </button>
          {profileNotice ? <p className="profile-notice">{profileNotice}</p> : null}
        </form>

        <form className="profile-card profile-form-card" onSubmit={savePassword}>
          <h2>{text.passwordFormTitle}</h2>
          <label>
            <span>{text.newPassword}</span>
            <div className="password-field">
              <input
                ref={newPasswordRef}
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Minimal 6 karakter"
              />
              <button type="button" onPointerDown={(event) => togglePasswordVisibility(event, newPasswordRef, setShowNewPassword)} aria-label={showNewPassword ? "Hide password" : "Show password"}>
                {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </label>
          <label>
            <span>{text.newPasswordRepeat}</span>
            <div className="password-field">
              <input
                ref={repeatPasswordRef}
                type={showRepeatPassword ? "text" : "password"}
                value={repeatPassword}
                onChange={(event) => setRepeatPassword(event.target.value)}
                placeholder={text.newPasswordRepeat}
              />
              <button type="button" onPointerDown={(event) => togglePasswordVisibility(event, repeatPasswordRef, setShowRepeatPassword)} aria-label={showRepeatPassword ? "Hide password" : "Show password"}>
                {showRepeatPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </label>
          <TurnstileBox siteKey={TURNSTILE_SITE_KEY} onTokenChange={setTurnstileToken} />
          <button className="profile-submit" type="submit" disabled={!turnstileToken || passwordLoading}>
            {passwordLoading ? <Loader2 className="spin" size={18} /> : <KeyRound size={18} />}
            {needsPasswordSetup ? text.passwordSetupCta : text.makePassword}
          </button>
          {passwordNotice ? <p className="profile-notice">{passwordNotice}</p> : null}
        </form>
      </div>
    </section>
  );
}

function Storefront({
  products,
  loading,
  apiMode,
  storeInfo,
  account,
  page,
  theme,
  language,
  headerHidden = false,
  showPasswordReminder = false,
  focusedOrderRef = "",
  onThemeToggle,
  onLanguageChange,
  onPage,
  onRequireLogin,
  onAuth,
  onProfile,
  onOrders,
  onLogout,
  onBuy,
  onPayOrder,
  onFocusConsumed,
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("SEMUA");
  const [homeActiveNav, setHomeActiveNav] = useState("home");
  const copy = getText(language);

  const categories = useMemo(() => {
    const set = new Set(products.map(guessCategory));
    return ["SEMUA", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const inCategory = category === "SEMUA" || guessCategory(product) === category;
      const inSearch = !needle || `${product.name} ${product.code} ${product.desc}`.toLowerCase().includes(needle);
      return inCategory && inSearch;
    });
  }, [products, query, category]);
  const heroProducts = useMemo(() => {
    return products
      .slice()
      .sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0))
      .slice(0, 6);
  }, [products]);
  const homeStats = useMemo(() => {
    const apiCompletedOrders = Number(storeInfo?.stats?.completedOrders);
    const totalSold = Number.isFinite(apiCompletedOrders)
      ? apiCompletedOrders
      : products.reduce((sum, product) => sum + Number(product?.sold || 0), 0);
    return { totalSold, totalProducts: products.length };
  }, [products, storeInfo]);
  const marqueeProducts = useMemo(() => {
    const names = [...new Set(
      products
        .map((product) => String(product?.name || product?.code || "").trim())
        .filter(Boolean)
    )];
    return names.length ? names : [copy.premiumApps];
  }, [products, copy.premiumApps]);

  const goPage = (nextPage) => {
    onPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goLandingAnchor = (target = "top") => {
    if (target === "catalog") {
      goPage("products");
      return;
    }
    onPage("home");
    setHomeActiveNav(target === "order-guide" ? "howto" : "home");
    window.setTimeout(() => {
      if (target === "top") window.scrollTo({ top: 0, behavior: "smooth" });
      else document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  useEffect(() => {
    if (page !== "home") {
      setHomeActiveNav("home");
      return undefined;
    }

    const updateActiveNav = () => {
      const guide = document.getElementById("order-guide");
      if (!guide) {
        setHomeActiveNav("home");
        return;
      }
      const guideTop = guide.getBoundingClientRect().top + window.scrollY;
      const activationLine = window.scrollY + Math.min(window.innerHeight * 0.38, 260);
      setHomeActiveNav(activationLine >= guideTop ? "howto" : "home");
    };

    updateActiveNav();
    window.addEventListener("scroll", updateActiveNav, { passive: true });
    window.addEventListener("resize", updateActiveNav);
    return () => {
      window.removeEventListener("scroll", updateActiveNav);
      window.removeEventListener("resize", updateActiveNav);
    };
  }, [page]);

  const openStatusOrder = () => {
    if (!account) {
      onRequireLogin();
      return;
    }
    goPage("status");
  };

  const footerNavigate = (target) => {
    if (target === "home") return goLandingAnchor("top");
    if (target === "products") return goPage("products");
    if (target === "howto") return goLandingAnchor("order-guide");
    if (target === "check" || target === "history" || target === "status") return openStatusOrder();
    return goPage(target);
  };

  const renderHero = () => (
    <section className="hero-panel">
      <div className="hero-copy">
        <span className="eyebrow">{copy.checkoutFast}</span>
        <h1>{copy.heroTitle}</h1>
        <p>{copy.heroDesc}</p>
        <div className="hero-actions">
          <button type="button" onClick={() => goPage("products")}>
            {copy.heroCta} <ArrowLeft size={18} />
          </button>
          <span><ShieldCheck size={17} /> {copy.stockRealtime}</span>
        </div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="hero-shelf-card">
          <div className="hero-shelf-head">
            <span>{copy.premiumApps}</span>
            <strong>{copy.topProducts}</strong>
          </div>
          <div className="hero-shelf-grid">
            {heroProducts.map((product, index) => {
              const icon = getProductWebIcon(product);
              const categoryTone = guessCategory(product).toLowerCase().replace(/\s+/g, "-");
              return (
                <div
                  className={`hero-shelf-tile tone-${categoryTone}`}
                  key={`${product.id || product.code || product.name}-${index}`}
                  style={{ "--tile-delay": `${index * -0.55}s` }}
                >
                  <div className="hero-shelf-icon">
                    {icon ? <img src={icon} alt="" /> : <span>{productInitials(product)}</span>}
                  </div>
                  <small>{guessCategory(product)}</small>
                </div>
              );
            })}
          </div>
          <div className="hero-shelf-badges">
            <span><CreditCard size={15} /> {copy.qrisReady}</span>
            <span><Star size={15} fill="currentColor" /> 5.0</span>
            <span><BadgeCheck size={15} /> {copy.readyStock}</span>
          </div>
        </div>
      </div>
    </section>
  );

  const renderProductMarquee = () => (
    <div className="app-marquee" aria-label="Produk premium apps">
      <div className="app-marquee-track">
        {[...marqueeProducts, ...marqueeProducts].map((item, index) => (
          <span key={`${item}-${index}`}>{item}<b aria-hidden="true">•</b></span>
        ))}
      </div>
    </div>
  );

  const renderHomeInfo = () => (
    <section className="home-info-section">
      {renderProductMarquee()}

      <div className="home-about-panel">
        <div className="section-label">{copy.homeBadge}</div>
        <div className="home-about-grid">
          <div className="home-about-copy">
            <h2>{copy.homeAboutTitle}</h2>
            <p>{copy.homeAboutDesc}</p>
          </div>
          <div className="home-feature-grid">
            <article className="home-feature-card tone-amber">
              <Zap size={34} />
              <h3>{copy.homeFeatureFastTitle}</h3>
              <p>{copy.homeFeatureFastDesc}</p>
            </article>
            <article className="home-feature-card tone-blue">
              <ShieldCheck size={34} />
              <h3>{copy.homeFeatureWarrantyTitle}</h3>
              <p>{copy.homeFeatureWarrantyDesc}</p>
            </article>
            <article className="home-feature-card tone-green">
              <BadgeCheck size={34} />
              <h3>{copy.homeFeatureStatusTitle}</h3>
              <p>{copy.homeFeatureStatusDesc}</p>
            </article>
          </div>
        </div>

        <div className="home-tag-row">
          {[copy.homeTagSecure, copy.homeTagProtected, copy.homeTagDelivery, copy.homeTagSupport].map((item, index) => (
            <span key={item} style={{ "--tag-delay": `${index * 120}ms` }}><CheckCircle2 size={16} /> {item}</span>
          ))}
        </div>

        <div className="home-stats-row">
          <article>
            <strong>{homeStats.totalSold.toLocaleString("id-ID")}</strong>
            <span>{copy.statOrders}</span>
          </article>
          <article>
            <strong>{homeStats.totalProducts}</strong>
            <span>{copy.statProducts}</span>
          </article>
          <article>
            <strong>24/7</strong>
            <span>{copy.statService}</span>
          </article>
        </div>
      </div>

      <HowToOrderSection language={language} />
    </section>
  );

  const renderProducts = () => (
    <section className="catalog-section" id="catalog">
      <div className="catalog-head">
        <button className="back-link compact" type="button" onClick={() => goPage("home")}>
          <ArrowLeft size={17} /> {copy.home}
        </button>
        <h2>{copy.catalogTitle}</h2>
      </div>

      <div className="tool-row">
        <div className="search-box">
          <Search size={19} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchProduct} />
          <button type="button"><ArrowLeft size={18} /></button>
        </div>
        <div className="category-row">
          {categories.map((item) => (
            <button key={item} className={item === category ? "active" : ""} type="button" onClick={() => setCategory(item)}>
              {item === "SEMUA" ? copy.all : item}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 className="spin" size={26} />
          <span>{copy.loadingCatalog}</span>
        </div>
      ) : (
        <section className="product-grid">
          {filtered.map((product, index) => (
            <ProductCard key={product.code || product.id} product={product} text={copy} onBuy={onBuy} animationIndex={index} />
          ))}
        </section>
      )}
    </section>
  );

  const pageContent = {
    home: (
      <>
        {renderHero()}
        {renderHomeInfo()}
      </>
    ),
    products: (
      <>
        {renderProductMarquee()}
        {renderProducts()}
      </>
    ),
    status: (
      <StatusOrderPage
        account={account}
        language={language}
        focusedOrderRef={focusedOrderRef}
        onFocusConsumed={onFocusConsumed}
        onPayOrder={onPayOrder}
      />
    ),
  }[page] || renderProducts();

  return (
    <main className="neo-page" id="top">
      <section className="neo-window">
        <SiteHeader
          copy={copy}
          storeInfo={storeInfo}
          page={page === "home" ? homeActiveNav : page}
          theme={theme}
          language={language}
          apiMode={apiMode}
          account={account}
          hidden={headerHidden}
          onHome={() => goLandingAnchor("top")}
          onProducts={() => goPage("products")}
          onHowto={() => goLandingAnchor("order-guide")}
          onStatus={openStatusOrder}
          onThemeToggle={onThemeToggle}
          onLanguageChange={onLanguageChange}
          onAuth={onAuth}
          onProfile={onProfile}
          onOrders={onOrders}
          onLogout={onLogout}
        />
        {showPasswordReminder ? (
          <PasswordSetupBanner language={language} onAction={onProfile} />
        ) : null}
        {pageContent}
        <SiteFooter language={language} storeInfo={storeInfo} onNavigate={footerNavigate} />
        <RecentPurchaseToast products={products} />
      </section>
    </main>
  );
}

function App() {
  const [products, setProducts] = useState(sampleProducts);
  const [storeInfo, setStoreInfo] = useState({ name: DEFAULT_STORE_BRAND, brandTitle: DEFAULT_STORE_BRAND });
  const [loading, setLoading] = useState(true);
  const [apiMode, setApiMode] = useState("demo");
  const [view, setView] = useState({ name: "catalog" });
  const [page, setPage] = useState("home");
  const [account, setAccount] = useState(() => loadSavedCustomer());
  const [theme, setTheme] = useState(() => localStorage.getItem(WEB_THEME_KEY) || "light");
  const [themeTransition, setThemeTransition] = useState(null);
  const [language, setLanguage] = useState(() => localStorage.getItem(WEB_LANG_KEY) || "id");
  const [headerHidden, setHeaderHidden] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [focusedOrderRef, setFocusedOrderRef] = useState("");
  const headerHiddenRef = useRef(false);

  const refreshStorefrontData = useCallback(async ({ initial = false } = {}) => {
    if (initial) setLoading(true);
    try {
      const { products: items, storeInfo: nextStoreInfo } = await loadStorefrontData();
      if (items.length) {
        setProducts(items);
        setApiMode("live");
      }
      if (nextStoreInfo?.name || nextStoreInfo?.brandTitle) {
        setStoreInfo(nextStoreInfo);
      }
      return true;
    } catch {
      setApiMode((current) => (current === "live" ? current : "demo"));
      return false;
    } finally {
      if (initial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    refreshStorefrontData({ initial: true }).finally(() => {
      if (!alive) return;
    });
    return () => { alive = false; };
  }, [refreshStorefrontData]);

  useEffect(() => {
    const refreshWhenActive = () => {
      if (document.visibilityState === "visible") refreshStorefrontData();
    };
    window.addEventListener("focus", refreshWhenActive);
    document.addEventListener("visibilitychange", refreshWhenActive);
    return () => {
      window.removeEventListener("focus", refreshWhenActive);
      document.removeEventListener("visibilitychange", refreshWhenActive);
    };
  }, [refreshStorefrontData]);

  useEffect(() => {
    document.title = getStoreDisplayName(storeInfo);
  }, [storeInfo]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(WEB_THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(WEB_LANG_KEY, language);
  }, [language]);

  useEffect(() => {
    if (!themeTransition) return undefined;
    const timer = window.setTimeout(() => setThemeTransition(null), 900);
    return () => window.clearTimeout(timer);
  }, [themeTransition]);

  useEffect(() => {
    headerHiddenRef.current = headerHidden;
  }, [headerHidden]);

  useEffect(() => {
    let lastY = window.scrollY;
    let lastToggleY = window.scrollY;
    let accumulated = 0;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const diff = currentY - lastY;
        const movingDown = diff > 0;
        const distanceFromToggle = Math.abs(currentY - lastToggleY);

        if (currentY < 120) {
          accumulated = 0;
          lastToggleY = currentY;
          headerHiddenRef.current = false;
          setHeaderHidden(false);
        } else if (Math.abs(diff) > 1) {
          const alreadyHidden = headerHiddenRef.current;
          const sameDirectionAsState = (movingDown && alreadyHidden) || (!movingDown && !alreadyHidden);
          accumulated = sameDirectionAsState ? 0 : accumulated + Math.abs(diff);

          if (movingDown && accumulated > 110 && distanceFromToggle > 140) {
            accumulated = 0;
            lastToggleY = currentY;
            headerHiddenRef.current = true;
            setHeaderHidden(true);
          } else if (!movingDown && accumulated > 70 && distanceFromToggle > 90) {
            accumulated = 0;
            lastToggleY = currentY;
            headerHiddenRef.current = false;
            setHeaderHidden(false);
          }
        }

        lastY = currentY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    headerHiddenRef.current = false;
    setHeaderHidden(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [page, view.name, view.mode, view.product?.id, view.order?.reference_id]);

  const showPasswordReminder = useMemo(
    () => shouldShowPasswordSetupReminder(account),
    [account, historyVersion]
  );

  const handleThemeToggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setThemeTransition({ theme: nextTheme, id: Date.now() });
    setTheme(nextTheme);
  };

  const renderThemeTransition = () => themeTransition ? (
    <div
      key={themeTransition.id}
      className={`theme-transition theme-transition-${themeTransition.theme}`}
      aria-hidden="true"
    >
      <div className="theme-transition-layer" />
      <div className="theme-transition-orb">
        {themeTransition.theme === "dark" ? <Moon size={38} /> : <Sun size={38} />}
      </div>
    </div>
  ) : null;

  const navigatePage = (nextPage) => {
    if (nextPage === "howto") {
      refreshStorefrontData();
      setPage("home");
      setView({ name: "catalog" });
      window.setTimeout(() => {
        document.getElementById("order-guide")?.scrollIntoView({ behavior: "smooth" });
      }, 0);
      return;
    }

    if (nextPage === "check" || nextPage === "history" || nextPage === "status") {
      refreshStorefrontData();
      if (!account) {
        setView({ name: "auth", mode: "login" });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setPage("status");
      setView({ name: "catalog" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (nextPage === "products") {
      refreshStorefrontData();
      setPage("products");
      setView({ name: "catalog" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (nextPage === "home") refreshStorefrontData();
    setPage(nextPage === "home" ? "home" : nextPage);
    setView({ name: "catalog" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openProfile = () => {
    if (!account) {
      setView({ name: "auth", mode: "login" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setView({ name: "profile" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openOrders = () => navigatePage("status");

  const openOrderDetail = (order) => {
    if (!order?.reference_id) return;
    savePaidOrderToHistory(order);
    if (order.access?.customer) setAccount(order.access.customer);
    setHistoryVersion((version) => version + 1);
    setFocusedOrderRef(order.reference_id);
    setPage("status");
    setView({ name: "catalog" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openPendingPayment = (order) => {
    if (!order?.reference_id) return;
    setView({ name: "payment", order: prepareOrderForPayment(order, account) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCheckout = (product) => {
    setView({
      name: "checkout",
      product,
      access: account
        ? { type: "account", customer: account, saveHistory: true }
        : { type: "guest", saveHistory: false },
    });
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  };

  const logoutAccount = () => {
    clearSavedCustomer();
    setAccount(null);
    setView({ name: "catalog" });
    setPage("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateAccount = (nextAccount) => {
    if (!nextAccount) return;
    setAccount(nextAccount);
  };

  const renderSharedHeader = ({ pageName = page, activeAuth = "" } = {}) => (
    <SiteHeader
      copy={getText(language)}
      storeInfo={storeInfo}
      page={pageName}
      theme={theme}
      language={language}
      apiMode={apiMode}
      account={account}
      activeAuth={activeAuth}
      hidden={headerHidden}
      onHome={() => navigatePage("home")}
      onProducts={() => navigatePage("products")}
      onHowto={() => navigatePage("howto")}
      onStatus={() => account ? navigatePage("status") : setView({ name: "auth", mode: "login" })}
      onThemeToggle={handleThemeToggle}
      onLanguageChange={setLanguage}
      onAuth={(mode) => setView({ name: "auth", mode })}
      onProfile={openProfile}
      onOrders={openOrders}
      onLogout={logoutAccount}
    />
  );

  if (view.name === "auth") {
    const activeAuth = view.mode === "login" ? "login" : "register";
    const authPageName = view.returnTo?.name === "checkout" ? "products" : "auth";
    return (
      <main className="neo-page" id="top">
        <section className="neo-window">
          {renderSharedHeader({ pageName: authPageName, activeAuth })}
          <AccessPanel
            key={`${view.mode}-${view.prefillContact || ""}`}
            initialMode={view.mode}
            initialContact={view.prefillContact || ""}
            language={language}
            storeInfo={storeInfo}
            onBack={() => setView({ name: "catalog" })}
            onNavigate={navigatePage}
            onContinue={(access) => {
              if (access.customer) setAccount(access.customer);
              if (view.returnTo?.name === "checkout" && view.returnTo.product) {
                setView({
                  name: "checkout",
                  product: view.returnTo.product,
                  access,
                });
                return;
              }
              setView({ name: "catalog" });
            }}
          />
          {renderThemeTransition()}
        </section>
      </main>
    );
  }

  if (view.name === "checkout") {
    return (
      <main className="neo-page" id="top">
        <section className="neo-window">
          {renderSharedHeader({ pageName: "products" })}
          <CheckoutPanel
            product={view.product}
            access={view.access}
            language={language}
            onBack={() => {
              setPage("products");
              setView({ name: "catalog" });
            }}
            onLogin={(mode = "register", prefillContact = "") => setView({ name: "auth", mode, prefillContact, returnTo: { name: "checkout", product: view.product } })}
            onNavigate={navigatePage}
            onPayment={(order) => {
              if (order.access?.customer) setAccount(order.access.customer);
              savePaidOrderToHistory(order);
              setView({ name: "payment", order });
            }}
          />
          {renderThemeTransition()}
        </section>
      </main>
    );
  }

  if (view.name === "profile") {
    return (
      <main className="neo-page" id="top">
        <section className="neo-window">
          {renderSharedHeader({ pageName: "profile" })}
          <ProfilePage
            account={account}
            language={language}
            onAccountUpdate={updateAccount}
            onOrders={openOrders}
            onShop={() => navigatePage("products")}
          />
          <SiteFooter language={language} storeInfo={storeInfo} onNavigate={navigatePage} />
          {renderThemeTransition()}
        </section>
      </main>
    );
  }

  if (view.name === "payment") {
    return (
      <main className="neo-page" id="top">
        <section className="neo-window">
          {renderSharedHeader({ pageName: "status" })}
          <PaymentPanel
            order={view.order}
            language={language}
            storeInfo={storeInfo}
            onBack={() => setView({ name: "checkout", product: view.order.product, access: view.order.access })}
            onNavigate={navigatePage}
            onPaid={(paidOrder) => {
              if (paidOrder.access?.customer) setAccount(paidOrder.access.customer);
              setHistoryVersion((version) => version + 1);
            }}
            onOpenOrder={openOrderDetail}
          />
          {renderThemeTransition()}
        </section>
      </main>
    );
  }

  return (
    <>
      <Storefront
        products={products}
        loading={loading}
        apiMode={apiMode}
        storeInfo={storeInfo}
        account={account}
        page={page}
        theme={theme}
        language={language}
        onThemeToggle={handleThemeToggle}
        onLanguageChange={setLanguage}
        onPage={navigatePage}
        onRequireLogin={() => setView({ name: "auth", mode: "login" })}
        onAuth={(mode) => setView({ name: "auth", mode })}
        onProfile={openProfile}
        onOrders={openOrders}
        onLogout={logoutAccount}
        showPasswordReminder={showPasswordReminder}
        focusedOrderRef={focusedOrderRef}
        onFocusConsumed={() => setFocusedOrderRef("")}
        headerHidden={headerHidden}
        onBuy={openCheckout}
        onPayOrder={openPendingPayment}
      />
      {renderThemeTransition()}
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
