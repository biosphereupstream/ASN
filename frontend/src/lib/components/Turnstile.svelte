<script lang="ts">
  /**
   * Cloudflare Turnstile widget (PRD FR-4.4).
   * Renders only when the public site key is provided at build/dev time
   * (Vite `PUBLIC_TURNSTILE_SITE_KEY`); otherwise a no-op so dev and CI
   * never need a Turnstile account. The backend independently verifies the
   * token against TURNSTILE_SECRET_KEY — this component never trusts the
   * client alone.
   */
  import { onMount } from 'svelte'
  import { env } from '$env/dynamic/public'

  const SITE_KEY = env.PUBLIC_TURNSTILE_SITE_KEY ?? ''

  let { onToken }: { onToken?: (token: string) => void } = $props()

  let container = $state<HTMLDivElement | null>(null)
  let widgetId: string | null = null
  let token = $state('')

  // Window typings for the Turnstile script API (minimal, untyped upstream).
  interface TurnstileApi {
    render: (el: HTMLElement, opts: Record<string, unknown>) => string
    remove: (id: string) => void
    reset: (id?: string) => void
  }

  function api(): TurnstileApi | undefined {
    return (window as unknown as { turnstile?: TurnstileApi }).turnstile
  }

  function loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (api()) return resolve()
      const w = window as unknown as { onloadTurnstileCb?: () => void }
      w.onloadTurnstileCb = () => resolve()
      const s = document.createElement('script')
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCb'
      s.async = true
      s.defer = true
      s.onerror = () => reject(new Error('turnstile-script-failed'))
      document.head.appendChild(s)
    })
  }

  onMount(() => {
    if (!SITE_KEY || !container) return
    let cancelled = false
    loadScript()
      .then(() => {
        if (cancelled || !container) return
        const t = api()
        if (!t) return
        widgetId = t.render(container, {
          sitekey: SITE_KEY,
          theme: 'light',
          callback: (tk: string) => {
            token = tk
            onToken?.(tk)
          },
          'expired-callback': () => {
            token = ''
            onToken?.('')
            api()?.reset(widgetId ?? undefined)
          },
          'error-callback': () => {
            token = ''
            onToken?.('')
          }
        })
      })
      .catch(() => {
        // Widget failed to load — leave token empty; the server decides
        // whether that is acceptable (it is a hard failure only when the
        // backend secret is configured).
      })
    return () => {
      cancelled = true
      if (widgetId !== null) api()?.remove(widgetId)
    }
  })
</script>

{#if SITE_KEY}
  <div class="mt-4 flex justify-center" data-testid="turnstile">
    <div bind:this={container}></div>
    <input type="hidden" name="cf-turnstile-response" bind:value={token} />
  </div>
{/if}
