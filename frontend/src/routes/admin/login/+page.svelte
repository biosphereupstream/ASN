<script lang="ts">
  import AsnLogo from '$lib/components/AsnLogo.svelte'

  let { data } = $props()
</script>

<svelte:head>
  <title>Masuk — ASN.NET Admin</title>
</svelte:head>

<div class="grid min-h-screen place-items-center bg-asn-silver-100/60 px-5">
  <div class="glossy w-full max-w-sm rounded-2xl p-8">
    <div class="mb-6 flex items-center gap-3">
      <AsnLogo size={40} />
      <div>
        <p class="font-extrabold tracking-tight">ASN<span class="text-asn-blue-500">.</span>NET Admin</p>
        <p class="text-[10px] font-bold tracking-[0.14em] text-asn-silver-600 uppercase">Smart Service, Strong Network</p>
      </div>
    </div>

    {#if data?.error}
      <div class="mb-4 rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-700">
        {#if data.error === 'RATE_LIMITED'}
          Terlalu banyak percobaan. Coba lagi dalam beberapa menit.
        {:else}
          Email atau kata sandi salah.
        {/if}
      </div>
    {/if}

    <form method="POST" class="grid gap-4">
      <label class="block">
        <span class="mb-1 block text-xs font-semibold text-asn-silver-600">Email</span>
        <input
          type="email"
          name="email"
          required
          autocomplete="username"
          placeholder="admin@asn.net"
          class="w-full rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-3 text-sm outline-none focus:border-asn-blue-500 focus:ring-2 focus:ring-asn-blue-500/30"
        />
      </label>
      <label class="block">
        <span class="mb-1 block text-xs font-semibold text-asn-silver-600">Kata sandi</span>
        <input
          type="password"
          name="password"
          required
          autocomplete="current-password"
          class="w-full rounded-xl border border-asn-silver-400/60 bg-white/80 px-3 py-3 text-sm outline-none focus:border-asn-blue-500 focus:ring-2 focus:ring-asn-blue-500/30"
        />
      </label>
      <button class="btn-primary rounded-xl py-3 text-sm font-bold" type="submit">Masuk</button>
    </form>

    {#if data?.devHint}
      <p class="mt-4 rounded-xl bg-asn-silver-100 px-3 py-2 text-[11px] leading-relaxed text-asn-ink-900/50">
        Mode dev: <code>admin@asn.net</code> / <code>admin123</code> — juga <code>sales@asn.net</code> (role sales).
      </p>
    {/if}
  </div>
</div>
