import { defineConfig, devices } from "@playwright/test"
import { BROWSER_CHANNEL, CC_URL, E2E_PORT, E2E_SLOW_MO, E2E_VIEWPORT } from "./app/playwright.helper"

export default defineConfig({
    testDir: "./app",
    testMatch: "**/*.e2e.ts",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",
    timeout: 10_000,

    // Serve the built app over HTTP rather than opening it from a file:// URL. A file:// origin's
    // IndexedDB is shared across all parallel browser contexts, so a concurrent test's storage clear
    // could wipe another test's persisted state mid-run (flaky IndexedDB-restore). An http://localhost
    // origin gives each Playwright context its own isolated, persistent storage.
    webServer: {
        command: `node e2e.staticServer.mjs ${E2E_PORT}`,
        url: CC_URL,
        timeout: 30_000,
        reuseExistingServer: !process.env.CI
    },

    use: {
        baseURL: CC_URL,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        viewport: E2E_VIEWPORT,
        launchOptions: {
            slowMo: E2E_SLOW_MO
        }
    },

    projects: [
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                channel: BROWSER_CHANNEL
            }
        }
    ]
})
