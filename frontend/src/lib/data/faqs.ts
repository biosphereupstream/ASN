export type FaqCategory = 'all' | 'pemasangan' | 'paket' | 'teknis' | 'cakupan'

export interface FaqItem {
  id: string
  category: 'pemasangan' | 'paket' | 'teknis' | 'cakupan'
  categoryLabel: string
  q: string
  a: string
}

export const CATEGORY_LABELS: Record<'pemasangan' | 'paket' | 'teknis' | 'cakupan', string> = {
  pemasangan: 'Pemasangan & Aktivasi',
  paket: 'Paket & Tagihan',
  teknis: 'Teknis & WiFi',
  cakupan: 'Cakupan & Jangkauan'
}

export const DEFAULT_FAQS: FaqItem[] = [
  // 1. Pemasangan & Aktivasi
  {
    id: 'pem-1',
    category: 'pemasangan',
    categoryLabel: 'Pemasangan & Aktivasi',
    q: 'Berapa lama proses pemasangan internet fiber ASN.NET?',
    a: 'Setelah formulir pendaftaran online Anda diverifikasi, tim customer care kami akan menghubungi Anda dalam 1×24 jam kerja untuk konfirmasi jadwal teknisi. Proses instalasi kabel fiber dan konfigurasi modem di rumah Anda umumnya memakan waktu 1–2 jam hingga internet aktif dan siap digunakan.'
  },
  {
    id: 'pem-2',
    category: 'pemasangan',
    categoryLabel: 'Pemasangan & Aktivasi',
    q: 'Dokumen apa saja yang diperlukan untuk mendaftar?',
    a: 'Pendaftaran sangat mudah dan tanpa ribet. Anda hanya perlu menyiapkan foto KTP/identitas resmi yang masih berlaku, nomor WhatsApp aktif, dan alamat lengkap pemasangan saat mengisi formulir online di website kami.'
  },
  {
    id: 'pem-3',
    category: 'pemasangan',
    categoryLabel: 'Pemasangan & Aktivasi',
    q: 'Apakah benar modem WiFi dan biaya instalasi pertama gratis?',
    a: 'Benar! Seluruh paket internet residensial ASN.NET sudah mencakup gratis biaya sewa modem WiFi optik (ONT) selama masa berlangganan serta gratis biaya instalasi kabel fiber standar tanpa biaya tersembunyi.'
  },
  {
    id: 'pem-4',
    category: 'pemasangan',
    categoryLabel: 'Pemasangan & Aktivasi',
    q: 'Apakah saya bisa memilih jadwal pemasangan di akhir pekan (Sabtu/Minggu)?',
    a: 'Bisa. Tim teknisi ASN.NET melayani pemasangan setiap hari termasuk hari Sabtu dan Minggu. Anda dapat mencantumkan preferensi tanggal pada formulir pendaftaran atau mengonfirmasikannya saat dihubungi oleh tim CS kami.'
  },

  // 2. Paket & Tagihan
  {
    id: 'pkt-1',
    category: 'paket',
    categoryLabel: 'Paket & Tagihan',
    q: 'Apa yang dimaksud dengan Unlimited tanpa batasan FUP?',
    a: 'FUP (Fair Usage Policy) adalah kebijakan pembatasan kecepatan internet setelah pemakaian mencapai kuota gigabyte tertentu. Di ASN.NET, koneksi 100% Unlimited murni tanpa batas FUP, sehingga kecepatan unduh dan unggah Anda tetap stabil dan kencang dari awal hingga akhir bulan.'
  },
  {
    id: 'pkt-2',
    category: 'paket',
    categoryLabel: 'Paket & Tagihan',
    q: 'Kapan tanggal jatuh tempo pembayaran tagihan bulanan?',
    a: 'Siklus tagihan berjalan setiap bulan terhitung sejak tanggal aktivasi layanan Anda. Notifikasi tagihan dan tautan pembayaran akan dikirimkan otomatis via WhatsApp 5 hari sebelum tanggal jatuh tempo.'
  },
  {
    id: 'pkt-3',
    category: 'paket',
    categoryLabel: 'Paket & Tagihan',
    q: 'Apa saja metode pembayaran yang didukung oleh ASN.NET?',
    a: 'Kami mendukung berbagai saluran pembayaran resmi yang praktis, antara lain Virtual Account (BCA, Mandiri, BNI, BRI, Permata), QRIS resmi untuk semua e-wallet (GoPay, OVO, Dana, ShopeePay), serta transfer bank langsung.'
  },
  {
    id: 'pkt-4',
    category: 'paket',
    categoryLabel: 'Paket & Tagihan',
    q: 'Apakah saya bisa melakukan upgrade atau downgrade paket kecepatan?',
    a: 'Tentu bisa. Anda dapat mengajukan perubahan paket kecepatan kapan saja dengan menghubungi customer service kami. Upgrade kecepatan dapat diaktifkan secara instan dalam 1×24 jam tanpa perlu mengganti perangkat modem.'
  },

  // 3. Teknis & WiFi
  {
    id: 'tek-1',
    category: 'teknis',
    categoryLabel: 'Teknis & WiFi',
    q: 'Apa perbedaan koneksi fiber optik murni dengan internet tembaga / kabel biasa?',
    a: 'Kabel serat optik (fiber optic) mentransmisikan data menggunakan gelombang cahaya murni, bukan arus listrik. Hasilnya adalah kecepatan simetris tinggi, latensi (ping) jauh lebih rendah, serta tahan terhadap gangguan cuaca hujan badai dan interferensi elektromagnetik.'
  },
  {
    id: 'tek-2',
    category: 'teknis',
    categoryLabel: 'Teknis & WiFi',
    q: 'Bagaimana cara mengoptimalkan jangkauan sinyal WiFi di rumah bertingkat?',
    a: 'Untuk rumah bertingkat atau luas di atas 150 m², kami menyarankan paket ASN.NET Mesh yang dilengkapi unit Mesh WiFi node tambahan. Teknologi Mesh menciptakan satu nama jaringan WiFi (seamless roaming) tanpa dead-zone dan sinyal tetap kuat di setiap lantai.'
  },
  {
    id: 'tek-3',
    category: 'teknis',
    categoryLabel: 'Teknis & WiFi',
    q: 'Berapa latensi (ping) koneksi ASN.NET untuk bermain game online?',
    a: 'Jaringan fiber optik ASN.NET dirancang dengan routing domestik dan internasional langsung (direct peering). Rata-rata latensi lokal adalah 2–8 ms dan server regional Asia Tenggara berkisar 15–25 ms, ideal untuk competitive gaming tanpa lag.'
  },
  {
    id: 'tek-4',
    category: 'teknis',
    categoryLabel: 'Teknis & WiFi',
    q: 'Apa yang harus saya lakukan jika koneksi internet tiba-tiba mengalami kendala?',
    a: 'Langkah pertama, coba restart modem Anda dengan mematikan daya selama 30 detik lalu menyalakannya kembali. Jika lampu indikator PON/LOS masih merah atau kedip-kedip, hubungi CS WhatsApp kami untuk pembuatan tiket gangguan teknis 24/7.'
  },

  // 4. Cakupan & Jangkauan
  {
    id: 'cak-1',
    category: 'cakupan',
    categoryLabel: 'Cakupan & Jangkauan',
    q: 'Bagaimana cara mengecek apakah perumahan atau kecamatan saya sudah tercover?',
    a: 'Anda dapat menggunakan fitur Cek Cakupan di halaman beranda atau mengunjungi halaman Cakupan Kota (/city). Pilih kota/kabupaten dan kecamatan Anda untuk melihat status ketersediaan jaringan secara langsung.'
  },
  {
    id: 'cak-2',
    category: 'cakupan',
    categoryLabel: 'Cakupan & Jangkauan',
    q: 'Apa yang harus dilakukan jika kecamatan saya belum tercover jaringan ASN.NET?',
    a: 'Anda dapat mengisi formulir Request Area (/request-area). Data permintaan lokasi Anda akan dicatat dalam peta prioritas ekspansi jaringan fiber kami. Semakin banyak peminat di satu area, semakin cepat tim teknis menggelar kabel fiber di sana.'
  },
  {
    id: 'cak-3',
    category: 'cakupan',
    categoryLabel: 'Cakupan & Jangkauan',
    q: 'Apa arti status "Segera Hadir" pada pengecekan jangkauan?',
    a: 'Status "Segera Hadir" menandakan bahwa tiang dan jalur kabel fiber backbone sedang dalam tahap pembangunan di kecamatan tersebut. Anda dapat mendaftar antrean (waitlist) untuk mendapatkan prioritas instalasi saat jaringan aktif.'
  },
  {
    id: 'cak-4',
    category: 'cakupan',
    categoryLabel: 'Cakupan & Jangkauan',
    q: 'Apakah ASN.NET melayani pemasangan untuk ruko, cafe, atau kantor bisnis?',
    a: 'Ya, kami memiliki lini produk ASN.NET Business yang dirancang khusus untuk operasional usaha, cafe, dan kantor dengan jaminan Service Level Agreement (SLA 99.5%), opsi IP Public Static, dan penanganan gangguan prioritas.'
  }
]
