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

/** Excludes a file extension through its segment in the distribution bar's right-click menu. */
const excludeFileExtension = async (page: import("@playwright/test").Page, extension: string) => {
    const segment = page.locator("cc-file-extension-bar-segment", { hasText: extension })
    await segment.click({ button: "right" })
    // The segment menu uses `data-test-id` (hyphenated), which getByTestId does not match.
    await page.locator('[data-test-id="excludeBuilding"]').click()
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

    test("should clear the metrics view's spinner shortly after excluding a file extension from the distribution bar", async ({ page }) => {
        // Arrange — the reported hang: excluding an extension on an already-settled map left the metrics
        // spinner up for good. The deferred rebuild was gated on a staleness flag that a sibling effect
        // only raised AFTER the render had already been skipped, so nothing ever cleared the spinner.
        await expect(page.locator("#codeMapScene")).toBeVisible()
        await expect(page.locator(spinnerOf("metrics"))).toBeHidden({ timeout: SPINNER_SETTLE_TIMEOUT_MS })
        await expect(page.locator("cc-file-extension-bar-segment", { hasText: "scss" })).toBeVisible()

        // Act
        await excludeFileExtension(page, "scss")

        // Assert — the spinner settles quickly and the excluded extension drops out of the distribution bar
        await expect(page.locator(spinnerOf("metrics"))).toBeHidden({ timeout: SPINNER_SETTLE_TIMEOUT_MS })
        await expect(page.locator("cc-file-extension-bar-segment", { hasText: "scss" })).toHaveCount(0)
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
