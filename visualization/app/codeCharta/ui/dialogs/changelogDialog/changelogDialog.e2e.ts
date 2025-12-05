import { test, expect } from "@playwright/test"
import { clearIndexedDB, goto } from "../../../../playwright.helper"
import fs from "fs"
import path from "path"

function getSecondLatestCodeChartaVersion() {
    const changelogPath = path.join(__dirname, "../../../../../CHANGELOG.md")
    const changelog = fs.readFileSync(changelogPath, "utf-8")
    const versionPattern = /\[(\d+\.\d+\.\d+)]/g
    const versions = changelog.match(versionPattern) || []
    const secondLatestVersion = versions[1]?.slice(1, -1)
    return secondLatestVersion
}

test.describe("changelogDialog", () => {
    test.beforeEach(async ({ page }) => {
        const version = getSecondLatestCodeChartaVersion() ?? ""
        await page.addInitScript(version => {
            localStorage.setItem("codeChartaVersion", version)
        }, version)
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should show entries between the last und newest release version", async ({ page }) => {
        const changelogDialog = page.locator(".mat-mdc-dialog-container")
        await changelogDialog.waitFor({ state: "visible", timeout: 6000 })
        const contentElement = changelogDialog.locator(".content")
        const changelogContent = await contentElement.textContent()

        expect(changelogContent?.length).not.toBe(0)
    })
})
