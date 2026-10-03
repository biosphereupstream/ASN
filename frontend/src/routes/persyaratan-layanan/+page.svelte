<script lang="ts">
  import SiteHeader from '$lib/components/SiteHeader.svelte'
  import SiteFooter from '$lib/components/SiteFooter.svelte'
  import { WA_URL } from '$lib/data/home'

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Beranda',
        item: 'https://asn.net.id/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Syarat & Ketentuan',
        item: 'https://asn.net.id/persyaratan-layanan'
      }
    ]
  }
</script>

<svelte:head>
  <title>Syarat dan Ketentuan Layanan — ASN.NET</title>
  <meta
    name="description"
    content="Syarat dan ketentuan berlangganan layanan internet fiber optik ASN.NET untuk pelanggan residensial dan bisnis."
  />
  <link rel="canonical" href="https://asn.net.id/persyaratan-layanan" />
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}</script>`}
</svelte:head>

<div class="min-h-screen flex flex-col bg-asn-silver-100/40 text-asn-ink-900 font-sans selection:bg-asn-blue-500 selection:text-white">
  <SiteHeader />

  <main class="flex-grow pt-24 pb-16">
    <!-- Breadcrumbs -->
    <nav class="mx-auto max-w-4xl px-5 py-3 text-xs text-asn-ink-900/60" aria-label="Breadcrumb">
      <ol class="flex items-center gap-2">
        <li>
          <a href="/" class="hover:text-asn-blue-700 transition">Beranda</a>
        </li>
        <li class="text-asn-silver-400">/</li>
        <li class="font-semibold text-asn-ink-900" aria-current="page">Syarat & Ketentuan</li>
      </ol>
    </nav>

    <!-- Document Header -->
    <section class="mx-auto max-w-4xl px-5 pt-4 pb-8">
      <div class="card p-8 sm:p-10 bg-white border border-asn-silver-400/30 rounded-3xl shadow-xs">
        <div class="inline-flex items-center gap-2 rounded-full bg-asn-blue-500/10 px-3 py-1 text-xs font-bold text-asn-blue-700 mb-4 border border-asn-blue-500/20">
          Dokumen Perjanjian Berlangganan Resmi
        </div>

        <h1 class="text-2xl sm:text-4xl font-black text-asn-ink-900 tracking-tight mb-2">
          Syarat dan Ketentuan Layanan
        </h1>
        <p class="text-xs text-asn-ink-900/60 mb-6">
          Terakhir diperbarui: 3 Oktober 2026 · PT Advance Service Network Indonesia
        </p>

        <p class="text-xs sm:text-sm text-asn-ink-900/80 leading-relaxed pb-6 border-b border-asn-silver-400/30">
          Selamat datang di ASN.NET. Dokumen Syarat dan Ketentuan ini mengatur hak, kewajiban, dan tata cara berlangganan layanan internet fiber optik murni (FTTH) yang diselenggarakan oleh PT Advance Service Network Indonesia (&ldquo;ASN.NET&rdquo;) kepada Pelanggan.
        </p>

        <!-- Terms Body Sections -->
        <div class="mt-8 space-y-8 text-xs sm:text-sm text-asn-ink-900/80 leading-relaxed">
          <section>
            <h2 class="text-base sm:text-lg font-black text-asn-ink-900 mb-2 flex items-center gap-2">
              <span class="h-6 w-6 rounded-lg bg-asn-blue-500/10 text-asn-blue-700 inline-flex items-center justify-center text-xs font-black">1</span>
              Definisi & Ruang Lingkup
            </h2>
            <ul class="list-disc ps-6 space-y-1.5 text-xs sm:text-sm">
              <li><strong>ASN.NET</strong> merujuk pada penyedia layanan telekomunikasi internet berbasis jaringan kabel fiber optik berlisensi resmi.</li>
              <li><strong>Pelanggan</strong> adalah perorangan atau badan usaha yang melakukan pendaftaran dan menggunakan layanan ASN.NET di alamat instalasi yang telah disepakati.</li>
              <li><strong>Layanan</strong> mencakup paket internet fiber residensial (Fiber, Stream, Mesh) maupun dedicated internet korporasi (Business).</li>
              <li><strong>Perangkat CPE (Customer Premises Equipment)</strong> adalah modem Optical Network Terminal (ONT) dan perangkat pendukung jaringan yang disediakan di lokasi Pelanggan.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-base sm:text-lg font-black text-asn-ink-900 mb-2 flex items-center gap-2">
              <span class="h-6 w-6 rounded-lg bg-asn-blue-500/10 text-asn-blue-700 inline-flex items-center justify-center text-xs font-black">2</span>
              Pendaftaran & Pemasangan Jaringan
            </h2>
            <ul class="list-disc ps-6 space-y-1.5 text-xs sm:text-sm">
              <li>Pendaftaran dilakukan secara daring melalui website resmi ASN.NET atau perwakilan penjualan resmi dengan memberikan data identitas dan alamat pemasangan yang valid.</li>
              <li>Pemasangan kabel fiber drop optik dan instalasi modem dilakukan oleh tim teknisi beridentitas resmi ASN.NET setelah proses verifikasi cakupan area berhasil disetujui.</li>
              <li>Biaya sewa modem optik dan biaya instalasi standar dinyatakan gratis selama masa promosi yang berlaku.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-base sm:text-lg font-black text-asn-ink-900 mb-2 flex items-center gap-2">
              <span class="h-6 w-6 rounded-lg bg-asn-blue-500/10 text-asn-blue-700 inline-flex items-center justify-center text-xs font-black">3</span>
              Kebijakan Pemakaian Wajar & Larangan Reselling (Anti RT/RW Net Ilegal)
            </h2>
            <ul class="list-disc ps-6 space-y-1.5 text-xs sm:text-sm">
              <li>ASN.NET berkomitmen menyediakan bandwidth <strong>100% Unlimited tanpa FUP</strong> (Fair Usage Policy), sehingga kecepatan tidak diturunkan secara sepihak berdasarkan total volume kuota bulanan.</li>
              <li>Paket Residensial (Fiber, Stream, Mesh) hanya diperbolehkan untuk kebutuhan pribadi, keluarga, dan penghuni di dalam satu bangunan alamat terdaftar.</li>
              <li><strong>Dilarang Keras:</strong> Pelanggan dilarang memperjualbelikan kembali, mendistribusikan ulang, menyewakan, atau menyebarluaskan bandwidth koneksi kepada pihak ketiga di luar alamat instalasi (praktik RT/RW Net ilegal) tanpa izin tertulis resmi dari direksi ASN.NET. Pelanggaran terhadap pasal ini dapat dikenakan pemutusan sepihak dan tindakan hukum sesuai Undang-Undang Telekomunikasi yang berlaku di Indonesia.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-base sm:text-lg font-black text-asn-ink-900 mb-2 flex items-center gap-2">
              <span class="h-6 w-6 rounded-lg bg-asn-blue-500/10 text-asn-blue-700 inline-flex items-center justify-center text-xs font-black">4</span>
              Perangkat Pinjam Pakai & Garansi
            </h2>
            <ul class="list-disc ps-6 space-y-1.5 text-xs sm:text-sm">
              <li>Perangkat modem WiFi (ONT) berstatus pinjam pakai selama Pelanggan aktif berlangganan layanan ASN.NET.</li>
              <li>Pelanggan wajib menjaga dan merawat perangkat CPE dari kerusakan akibat kelalaian pribadi, kebakaran, atau modifikasi perangkat keras tanpa izin.</li>
              <li>Apabila terjadi malafungsi teknis atau kerusakan bawaan pabrik, tim teknisi ASN.NET akan melakukan penggantian unit modem tanpa pungutan biaya.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-base sm:text-lg font-black text-asn-ink-900 mb-2 flex items-center gap-2">
              <span class="h-6 w-6 rounded-lg bg-asn-blue-500/10 text-asn-blue-700 inline-flex items-center justify-center text-xs font-black">5</span>
              Tagihan & Pembayaran Bulanan
            </h2>
            <ul class="list-disc ps-6 space-y-1.5 text-xs sm:text-sm">
              <li>Tagihan diterbitkan setiap bulan secara flat sesuai tarif paket dan area yang disepakati pada saat konfirmasi pendaftaran.</li>
              <li>Pembayaran wajib diselesaikan sebelum tanggal jatuh tempo melalui saluran resmi yang tersedia (Transfer Bank, Virtual Account, QRIS resmi).</li>
              <li>Keterlambatan pembayaran dapat berakibat pada penonaktifan sementara (isolir) jaringan sampai kewajiban pembayaran diselesaikan.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-base sm:text-lg font-black text-asn-ink-900 mb-2 flex items-center gap-2">
              <span class="h-6 w-6 rounded-lg bg-asn-blue-500/10 text-asn-blue-700 inline-flex items-center justify-center text-xs font-black">6</span>
              Service Level Agreement (SLA) & Penanganan Gangguan
            </h2>
            <ul class="list-disc ps-6 space-y-1.5 text-xs sm:text-sm">
              <li>ASN.NET menyiagakan Network Operations Center (NOC) 24/7 untuk menjaga stabilitas jalur fiber optik.</li>
              <li>Laporan gangguan dapat disampaikan melalui Customer Support WhatsApp Resmi. Jadwal kunjungan teknisi penanganan lapangan dilakukan dalam kurun waktu 1×24 jam kerja sejak tiket diterbitkan.</li>
              <li>Pemeliharaan rutin jaringan (scheduled maintenance) akan diinformasikan sebelumnya kepada Pelanggan.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-base sm:text-lg font-black text-asn-ink-900 mb-2 flex items-center gap-2">
              <span class="h-6 w-6 rounded-lg bg-asn-blue-500/10 text-asn-blue-700 inline-flex items-center justify-center text-xs font-black">7</span>
              Penghentian & Pemutusan Berlangganan
            </h2>
            <ul class="list-disc ps-6 space-y-1.5 text-xs sm:text-sm">
              <li>Pelanggan dapat mengajukan permohonan penghentian layanan atau relokasi alamat minimal 14 (empat belas) hari kalender sebelum siklus penagihan berikutnya.</li>
              <li>Saat pemutusan layanan berlaku, teknisi ASN.NET akan melakukan penarikan perangkat modem CPE pinjaman dalam kondisi lengkap dan baik.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-base sm:text-lg font-black text-asn-ink-900 mb-2 flex items-center gap-2">
              <span class="h-6 w-6 rounded-lg bg-asn-blue-500/10 text-asn-blue-700 inline-flex items-center justify-center text-xs font-black">8</span>
              Hukum & Perlindungan Data Pribadi
            </h2>
            <p class="text-xs sm:text-sm">
              Perjanjian ini diatur berdasarkan hukum yang berlaku di Negara Kesatuan Republik Indonesia. Pengelolaan dan penyimpanan data Pelanggan tunduk pada Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022) sebagaimana dijelaskan dalam <a href="/privacy" class="text-asn-blue-700 font-bold underline">Kebijakan Privasi ASN.NET</a>.
            </p>
          </section>
        </div>

        <!-- Help Banner inside card -->
        <div class="mt-10 pt-6 border-t border-asn-silver-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-sm font-bold text-asn-ink-900">Punya pertanyaan seputar Syarat & Ketentuan?</h3>
            <p class="text-xs text-asn-ink-900/60">Tim layanan pelanggan kami siap membantu Anda setiap hari.</p>
          </div>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            class="btn-primary rounded-full px-5 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
          >
            Hubungi Customer Care
          </a>
        </div>
      </div>
    </section>
  </main>

  <SiteFooter />
</div>
