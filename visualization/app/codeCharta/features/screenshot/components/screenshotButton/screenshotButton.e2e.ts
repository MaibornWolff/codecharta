import { expect, test } from "@playwright/test"
import { goto } from "../../../../../playwright.helper"

test.describe("ScreenshotButton", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test("should download a png of the map from the view-cube toolbox", async ({ page }) => {
        // Arrange
        await expect(page.locator("#codeMapScene")).toBeVisible()

        // Act
        const download = page.waitForEvent("download")
        await page.locator("cc-view-cube-toolbox button[aria-label='Screenshot']").click()

        // Assert
        expect((await download).suggestedFilename()).toMatch(/_map\.png$/)
    })

    test("should take the map screenshot on the Ctrl+Alt+S hotkey", async ({ page }) => {
        // Arrange
        await expect(page.locator("#codeMapScene")).toBeVisible()

        // Act
        const download = page.waitForEvent("download")
        await page.keyboard.press("Control+Alt+KeyS")

        // Assert
        expect((await download).suggestedFilename()).toMatch(/_map\.png$/)
    })
})
