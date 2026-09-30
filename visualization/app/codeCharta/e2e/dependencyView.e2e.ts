import { expect, test } from "@playwright/test"
import { clearIndexedDB, goto } from "../../playwright.helper"
import { ViewSwitcherPageObject } from "../features/navBar/components/viewSwitcher/viewSwitcher.po"

test.describe("DependencyView", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should open the dependency graph of the startup samples", async ({ page }) => {
        // Arrange
        const viewSwitcher = new ViewSwitcherPageObject(page)

        // Act
        await viewSwitcher.switchToDependencies()

        // Assert
        await expect(page.getByTestId("dependency-graph").locator("canvas")).toBeVisible()
        await expect(page.getByText("No file in view carries dependency levels.")).toHaveCount(0)
    })
})
