import { defineConfig, devices } from "@playwright/test"
import path from "path"

const CC_URL = `file:${path.join(__dirname, "dist/bundler/browser/index.html")}`

export default defineConfig({
    testDir: "./app",
    testMatch: "**/*.e2e.ts",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",
    timeout: 60_000,

    use: {
        baseURL: CC_URL,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
            args: ["--allow-file-access-from-files"],
            slowMo: 25
        }
    },

    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] }
        }
    ]
})
