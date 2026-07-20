import { expect, test } from "@playwright/test"
import { clearIndexedDB, goto } from "../../playwright.helper"
import { ViewSwitcherPageObject } from "../features/navBar/components/viewSwitcher/viewSwitcher.po"

/** Long enough to outlast any legitimate settle, short enough that a hung spinner still fails fast. */
const SPINNER_SETTLE_TIMEOUT_MS = 8_000

const spinnerOf = (view: "metrics" | "domain") => `cc-${view}-view #loading-gif-file`

/** Selecting another map from the nav bar changes the visible file set without loading anything. */
const selectMap = async (page: import("@playwright/test").Page, name: string) => {
    const trigger = page.locator("cc-map-selector .dropdown > button")
    await trigger.click()
    await page.locator("cc-map-selector .dropdown-content ul li label", { hasText: name }).first().click()
    await page.keyboard.press("Escape")
}

test.describe("view loading spinner", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should clear the domain view's spinner after the visible file set changes", async ({ page }) => {
        // Arrange — the reported hang: on the domain view there is no 3D map render to wait for, so a
        // file-selection change used to leave the spinner up until the max-wait deadline.
        const viewSwitcher = new ViewSwitcherPageObject(page)
        await viewSwitcher.switchToDomain()
        await expect(page.locator(spinnerOf("domain"))).toBeHidden({ timeout: SPINNER_SETTLE_TIMEOUT_MS })

        // Act
        await selectMap(page, "sample2")

        // Assert
        await expect(page.locator(spinnerOf("domain"))).toBeHidden({ timeout: SPINNER_SETTLE_TIMEOUT_MS })
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
    })

    test("should clear the metrics view's spinner when returning to a map that changed while away", async ({ page }) => {
        // Arrange — the map render is deferred while the metrics view is off screen, so the rebuild
        // happens on the way back in. Its spinner must come down once that rebuild settles.
        const viewSwitcher = new ViewSwitcherPageObject(page)
        await viewSwitcher.switchToDomain()
        await selectMap(page, "sample2")
        await expect(page.locator(spinnerOf("domain"))).toBeHidden({ timeout: SPINNER_SETTLE_TIMEOUT_MS })

        // Act
        await viewSwitcher.switchToMetrics()

        // Assert
        await expect(page.locator(spinnerOf("metrics"))).toBeHidden({ timeout: SPINNER_SETTLE_TIMEOUT_MS })
        await expect(page.locator("#codeMapScene")).toBeVisible()
    })

    test("should not leave a spinner up when switching back and forth between the views", async ({ page }) => {
        // Arrange
        const viewSwitcher = new ViewSwitcherPageObject(page)

        // Act — nothing changed in between, so neither view has anything to rebuild
        await viewSwitcher.switchToDomain()
        await viewSwitcher.switchToMetrics()
        await viewSwitcher.switchToDomain()

        // Assert
        await expect(page.locator(spinnerOf("domain"))).toBeHidden({ timeout: SPINNER_SETTLE_TIMEOUT_MS })
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
    })
})
