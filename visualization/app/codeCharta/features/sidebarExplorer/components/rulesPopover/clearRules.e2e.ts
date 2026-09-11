import { expect, test } from "@playwright/test"
import { clearIndexedDB, goto } from "../../../../../playwright.helper"

const chipCounts = async (page: import("@playwright/test").Page) =>
    (await page.locator("cc-explorer-count-chip").allInnerTexts()).map(text => text.replace("\n", " "))

async function addMetricRule(page: import("@playwright/test").Page, kind: "flatten" | "exclude", metric: string, value: string) {
    await page.keyboard.press("Escape")
    await page.getByTestId("search-bar-actions-trigger").first().click()
    const entry = page.getByTestId(`search-bar-${kind}-by-metric-button`)
    await entry.waitFor({ state: "visible" })
    await entry.click()

    const editor = page.getByTestId(`metric-rule-editor-${kind}`)
    await editor.getByTestId("metric-rule-editor-metric").click()
    await editor.locator(`button[data-metric-name='${metric}']`).click()
    await editor.getByTestId("metric-rule-editor-operator").selectOption("gt")
    await editor.getByTestId("metric-rule-editor-value").fill(value)
    await editor.getByTestId("metric-rule-editor-submit").click()
}

test.describe("Clearing rules", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should clear one list from its popover, leaving the other alone", async ({ page }) => {
        // Arrange — one rule in each list
        await addMetricRule(page, "flatten", "rloc", "50")
        await addMetricRule(page, "exclude", "sonar_complexity", "60")
        await expect.poll(async () => (await chipCounts(page))[1]).toBe("FLATTENED 6")

        // Act — clear only the flattened list
        await page.locator("cc-explorer-count-chip button").nth(0).click()
        const flattenPopover = page.locator("#explorer-flatten-rules")
        await flattenPopover.getByTestId("rules-popover-clear-button").click()
        await page.getByTestId("rules-popover-clear-confirm-flatten").getByTestId("confirm-dialog-yes").click()

        // Assert
        await expect.poll(async () => await chipCounts(page)).toEqual(["SHOWN 4", "FLATTENED 0", "HIDDEN 4"])
    })

    test("should put every file back with reset filters", async ({ page }) => {
        // Arrange
        await addMetricRule(page, "flatten", "rloc", "50")
        await addMetricRule(page, "exclude", "sonar_complexity", "60")
        await expect.poll(async () => (await chipCounts(page))[2]).toBe("HIDDEN 4")

        // Act
        await page.keyboard.press("Escape")
        await page.locator('button[title="Global Configuration"]').click()
        await page.getByTestId("reset-filters-button").click()
        await page.getByTestId("reset-filters-confirm").getByTestId("confirm-dialog-yes").click()

        // Assert
        await expect.poll(async () => await chipCounts(page)).toEqual(["SHOWN 8", "FLATTENED 0", "HIDDEN 0"])
    })
})
