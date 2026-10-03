<script lang="ts">
  import { WA_URL } from '$lib/data/home'
  /**
   * Kebijakan Privasi (PRD FR-4.5): the consent checkbox on /daftar and
   * /request-area links here. Plain-language summary of how lead data is
   * processed under UU PDP No. 27/2022. Static marketing copy — legal review
   * pending (PRD §17 open question).
   */
</script>

<svelte:head>
  <title>Kebijakan Privasi — ASN.NET</title>
  <meta name="description" content="Bagaimana ASN.NET mengumpulkan, menggunakan, dan melindungi data pribadi kamu sesuai UU PDP No. 27/2022." />
  <link rel="icon" href="favicon.svg" type="image/svg+xml" />
</svelte:head>

<main class="relative min-h-screen overflow-x-clip bg-white">
  <div
    aria-hidden="true"
    class="pointer-events-none absolute -top-40 right-[-10%] h-[480px] w-[480px] rounded-full opacity-50 blur-3xl"
    style="background: radial-gradient(circle, rgba(125, 211, 252, 0.35), transparent 70%)"
  ></div>

  <section class="relative mx-auto max-w-3xl px-4 pb-20 pt-10 sm:pt-14">
    <nav class="mb-8" aria-label="Navigasi">
      <a href="/" class="text-sm font-bold text-asn-ink-900/70 transition hover:text-asn-blue-700">← Beranda</a>
    </nav>

    <h1 class="mb-2 text-2xl font-extrabold text-asn-ink-900">Kebijakan Privasi</h1>
    <p class="mb-8 text-sm text-asn-ink-900/60">Terakhir diperbarui: 23 September 2026</p>

    <div class="prose-sm space-y-8 text-sm leading-relaxed text-asn-ink-900/80">
      <section>
        <h2 class="mb-2 text-lg font-bold text-asn-ink-900">1. Data yang kami kumpulkan</h2>
        <p>
          Saat kamu mendaftar layanan atau mengajukan permintaan area, kami mengumpulkan: nama lengkap, nomor WhatsApp,
          email (opsional), alamat pemasangan, paket yang diminati, dan tanggal pemasangan yang diinginkan. Data ini kami
          gunakan semata-mata untuk memproses pendaftaran dan menghubungimu.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-asn-ink-900">2. Bagaimana kami menggunakan data</h2>
        <ul class="list-disc space-y-1 ps-5">
          <li>Menghubungimu untuk konfirmasi pendaftaran dan penjadwalan survei/pemasangan.</li>
          <li>Memeriksa ketersediaan jaringan di alamatmu.</li>
          <li>Menyusun rencana pembangunan jaringan secara agregat (tanpa mengidentifikasi individu) dari permintaan area.</li>
          <li>Memenuhi kewajiban hukum yang berlaku.</li>
        </ul>
        <p class="mt-2">
          Kami <strong>tidak</strong> menjual atau membagikan data pribadimu kepada pihak ketiga untuk tujuan pemasaran.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-asn-ink-900">3. Dasar pemrosesan & persetujuan (UU PDP No. 27/2022)</h2>
        <p>
          Kami memproses data pribadi berdasarkan persetujuan eksplisit yang kamu berikan melalui kotak persetujuan pada
          formulir pendaftaran. Kamu dapat menarik persetujuan kapan saja dengan menghubungi kami; penarikan tidak
          memengaruhi pemrosesan yang telah dilakukan sebelumnya.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-asn-ink-900">4. Retensi data</h2>
        <p>
          Data pendaftaran disimpan selama diperlukan untuk memproses permintaanmu dan maksimal 24 bulan setelah interaksi
          terakhir, kecuali diwajibkan lain oleh hukum. Permintaan area anonim-disimpan secara agregat untuk analisis
          jangka panjang.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-asn-ink-900">5. Keamanan</h2>
        <p>
          Data dikirim melalui koneksi terenkripsi (HTTPS) dan disimpan pada basis data yang dibatasi aksesnya hanya untuk
          personel berwenang. Kata sandi akun internal di-hash dan sesi dikelola dengan cookie aman.
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-asn-ink-900">6. Hak-hakmu</h2>
        <ul class="list-disc space-y-1 ps-5">
          <li>Meminta akses, salinan, atau koreksi data pribadimu.</li>
          <li>Meminta penghapusan data (hak dilupakan) sepanjang tidak bertentangan dengan kewajiban hukum.</li>
          <li>Mengajukan keberatan atas pemrosesan tertentu.</li>
        </ul>
      </section>

      <section>
        <h2 class="mb-2 text-lg font-bold text-asn-ink-900">7. Hubungi kami</h2>
        <p>
          Untuk pertanyaan seputar privasi atau untuk menggunakan hak-hakmu di atas, hubungi
          <a href={WA_URL} class="font-bold text-asn-blue-700 underline underline-offset-2">WhatsApp resmi kami</a>
          atau kunjungi halaman <a href="/daftar" class="font-bold text-asn-blue-700 underline underline-offset-2">pendaftaran</a>.
        </p>
      </section>
    </div>
  </section>
</main>
