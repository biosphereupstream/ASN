<script lang="ts">
  import AsnLogo from './AsnLogo.svelte'
  import { WA_NUMBER } from '$lib/data/home'
</script>

<footer class="border-t border-asn-silver-400/40 bg-asn-silver-100/30 text-asn-ink-900/70 pt-12 pb-24 sm:pb-12 text-xs">
  <div class="mx-auto max-w-6xl px-5">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-asn-silver-400/40">
      <!-- Col 1: Brand -->
      <div class="md:col-span-1 space-y-3">
        <a href="/" class="flex items-center gap-2.5">
          <AsnLogo size={36} />
          <span class="flex flex-col leading-none">
            <span class="text-base font-extrabold tracking-tight text-asn-ink-900">ASN<span class="text-asn-blue-500">.</span>NET</span>
            <span class="mt-0.5 text-[8px] font-bold tracking-[0.14em] text-asn-silver-600 uppercase">Fiber Broadband</span>
          </span>
        </a>
        <p class="text-asn-ink-900/60 leading-relaxed text-[11px]">
          Penyedia internet 100% fiber optik murni berkecepatan tinggi tanpa batasan kuota (FUP) untuk rumah dan bisnis Anda.
        </p>
        <p class="font-bold text-asn-ink-900 text-[11px]">PT Advance Service Network Indonesia</p>
      </div>

      <!-- Col 2: Layanan -->
      <div class="space-y-2.5">
        <h4 class="font-extrabold text-asn-ink-900 text-xs uppercase tracking-wider">Layanan</h4>
        <ul class="space-y-2">
          <li><a href="/layanan/fiber" class="hover:text-asn-blue-700 transition">ASN.NET Fiber (Rumah)</a></li>
          <li><a href="/layanan/stream" class="hover:text-asn-blue-700 transition">ASN.NET Stream (Bundle OTT)</a></li>
          <li><a href="/layanan/mesh" class="hover:text-asn-blue-700 transition">ASN.NET Mesh (Whole-Home)</a></li>
          <li><a href="/layanan/business" class="hover:text-asn-blue-700 transition">ASN.NET Business (UKM/Kantor)</a></li>
          <li><a href="/paket" class="hover:text-asn-blue-700 transition font-semibold text-asn-blue-700">Katalog Lengkap Paket →</a></li>
        </ul>
      </div>

      <!-- Col 3: Navigasi & Legal -->
      <div class="space-y-2.5">
        <h4 class="font-extrabold text-asn-ink-900 text-xs uppercase tracking-wider">Informasi</h4>
        <ul class="space-y-2">
          <li><a href="/city" class="hover:text-asn-blue-700 transition">Daftar Kota & Jangkauan</a></li>
          <li><a href="/#cek" class="hover:text-asn-blue-700 transition">Cek Cakupan Area</a></li>
          <li><a href="/request-area" class="hover:text-asn-blue-700 transition">Permintaan Jangkauan Area</a></li>
          <li><a href="/faq" class="hover:text-asn-blue-700 transition">Tanya Jawab (FAQ)</a></li>
          <li><a href="/persyaratan-layanan" class="hover:text-asn-blue-700 transition">Syarat & Ketentuan</a></li>
          <li><a href="/privacy" class="hover:text-asn-blue-700 transition">Kebijakan Privasi (UU PDP)</a></li>
        </ul>
      </div>

      <!-- Col 4: Bantuan & Kontak -->
      <div class="space-y-2.5">
        <h4 class="font-extrabold text-asn-ink-900 text-xs uppercase tracking-wider">Hubungi Kami</h4>
        <p class="text-asn-ink-900/60 leading-relaxed">Ada pertanyaan atau butuh bantuan pendaftaran?</p>
        <div class="space-y-2 pt-1">
          <a
            href="https://wa.me/{WA_NUMBER}"
            target="_blank"
            rel="noopener noreferrer"
            class="glossy inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-asn-ink-900 hover:border-asn-blue-500/50"
          >
            <span>💬</span> WhatsApp CS Resmi
          </a>
        </div>
      </div>
    </div>

    <!-- Copyright -->
    <div class="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] text-asn-ink-900/50">
      <p>© 2026 ASN.NET · All rights reserved. Smart Service, Strong Network.</p>
      <div class="flex items-center gap-4">
        <a href="/privacy" class="hover:underline">Privasi</a>
        <a href="/admin/login" class="hover:underline">Admin Login</a>
      </div>
    </div>
  </div>
</footer>
