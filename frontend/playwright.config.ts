import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

const here = fileURLToPath(new URL('.', import.meta.url))

/**
 * E2E tests for the ASN.NET lead flow (PRD FR-4 / §6.4).
 *
 * The CDN for Playwright's managed Chromium is unreachable on this network,
 * so the suite drives the installed Google Chrome (channel: 'chrome') with
 * `--use-mock-keychain` to avoid macOS/Windows keychain prompts in headless runs.
 *
 * Two web servers (mirrors .freebuff/run.md):
 *   - backend  : ElysiaJS + in-process PGlite on :3001 (migrates + seeds on boot)
 *   - frontend : SvelteKit dev server on :5199, proxying /api/* → :3001
 *
 * baseURL is set to 127.0.0.1 (not localhost) so the cookie/session handling
 * matches the preview URL exactly.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // per-IP rate limits + shared DB → serial execution
  workers: 1,
  retries: 0,
  // 4 minutes: tests may pause 65s+ for the dev per-IP rate limit to reset.
  timeout: 240_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5199',
    trace: 'retain-on-failure',
    launchOptions: {
      args: ['--use-mock-keychain']
    }
  },
  projects: [{ name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }],
  webServer: [
    {
      command: 'bun run dev',
      cwd: `${here}../backend`,
      url: 'http://127.0.0.1:3001/api/health',
      reuseExistingServer: true,
      timeout: 60_000,
      env: {
        // The suite shares 127.0.0.1 with everything else on this machine;
        // raise the FR-4.4 caps for this process so tests don't fight the
        // 5/min + 10/h production defaults. Production is unaffected.
        RATE_LIMIT_MAX_PER_MINUTE: '100',
        RATE_LIMIT_MAX_PER_HOUR: '1000'
      }
    },
    {
      command: 'bun run dev --host 127.0.0.1 --port 5199',
      cwd: here,
      url: 'http://127.0.0.1:5199/',
      reuseExistingServer: true,
      timeout: 90_000
    }
  ]
})
