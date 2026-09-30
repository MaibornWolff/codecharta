import { expect, type Page, test } from "@playwright/test"
import { clearIndexedDB, goto } from "../../playwright.helper"
import { ViewSwitcherPageObject } from "../features/navBar/components/viewSwitcher/viewSwitcher.po"

async function switchOnDependencyView(page: Page) {
    await page.locator('button[title="Global Configuration"]').click()
    await page.getByText("Enable Dependency View (experimental)").click()
    await page.getByRole("button", { name: "Close", exact: true }).click()
}

test.describe("DependencyView", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should offer the dependency view only once it is switched on in the global configuration", async ({ page }) => {
        // Arrange
        const viewSwitcher = new ViewSwitcherPageObject(page)
        await expect(viewSwitcher.dependenciesTab()).toHaveCount(0)

        // Act
        await switchOnDependencyView(page)

        // Assert
        await expect(viewSwitcher.dependenciesTab()).toBeVisible()
    })

    test("should open the dependency graph of the startup samples", async ({ page }) => {
        // Arrange
        const viewSwitcher = new ViewSwitcherPageObject(page)
        await switchOnDependencyView(page)

        // Act
        await viewSwitcher.switchToDependencies()

        // Assert
        await expect(page.getByTestId("dependency-graph").locator("canvas")).toBeVisible()
        await expect(page.getByText("No file in view carries dependency levels.")).toHaveCount(0)
    })
})
