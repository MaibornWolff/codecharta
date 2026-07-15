import { defineConfig, devices } from "@playwright/test"
import { CC_URL, E2E_PORT } from "./app/playwright.helper"

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
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
            slowMo: 25
        }
    },

    projects: [
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                // Use system Chrome instead of Playwright's bundled Chromium (bundled Chromium lacks WebGL support
                // in headless mode on macOS). Google Chrome is not built for Linux arm64, so fall back to the
                // bundled Chromium there — its headless WebGL works on Linux.
                channel: process.platform === "linux" && process.arch === "arm64" ? "chromium" : "chrome"
            }
        }
    ]
})
