import { test, expect } from "@playwright/test"
import { clearIndexedDB, goto } from "./playwright.helper"

test.describe("app", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should not have errors in console", async ({ page }) => {
        const errors: string[] = []
        page.on("console", message => {
            if (message.type() === "error") {
                errors.push(message.text())
            }
        })
        await goto(page)
        await page.locator("#loading-gif-file").waitFor({ state: "hidden" })
        expect(errors).toHaveLength(0)
    })
})
