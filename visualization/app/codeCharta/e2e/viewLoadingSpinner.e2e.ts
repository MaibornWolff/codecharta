import { expect, test } from "@playwright/test"
import { clearIndexedDB, goto, waitForCcStatePersisted } from "../../playwright.helper"
import { ViewSwitcherPageObject } from "../features/navBar/components/viewSwitcher/viewSwitcher.po"

const SPINNER_SETTLE_TIMEOUT_MS = 8_000

const spinnerOf = (view: "metrics" | "domain") => `cc-${view}-view #loading-gif-file`

const selectMap = async (page: import("@playwright/test").Page, name: string) => {
    const trigger = page.locator("cc-map-selector .dropdown > button")
    await trigger.click()
    await page.locator("cc-map-selector .dropdown-content ul li label", { hasText: name }).first().click()
    await page.keyboard.press("Escape")
}

const excludeFileExtension = async (page: import("@playwright/test").Page, extension: string) => {
    const segment = page.locator("cc-file-extension-bar-segment", { hasText: extension })
    await segment.click({ button: "right" })
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

    test("should clear the metrics view's spinner when the session started on the domain view", async ({ page }) => {
        // Arrange — the session is persisted on the domain view and the app is started again there, so
        // the metrics view has never been shown and its canvas does not exist yet
        const viewSwitcher = new ViewSwitcherPageObject(page)
        await viewSwitcher.switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible({ timeout: SPINNER_SETTLE_TIMEOUT_MS })
        await waitForCcStatePersisted(page, "sample1.cc.json")
        await page.reload()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible({ timeout: SPINNER_SETTLE_TIMEOUT_MS })

        // Act
        await viewSwitcher.switchToMetrics()

        // Assert — the deferred map waits for the canvas this first visit mounts; building it before
        // that threw where the floor labels measure the canvas, which left the spinner up for good
        await expect(page.locator(spinnerOf("metrics"))).toBeHidden({ timeout: SPINNER_SETTLE_TIMEOUT_MS })
        await expect(page.locator("#codeMapScene")).toBeVisible()
    })
})
