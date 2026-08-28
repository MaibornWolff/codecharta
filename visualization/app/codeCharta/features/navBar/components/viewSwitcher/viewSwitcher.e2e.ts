import { expect, test } from "@playwright/test"
import { clearIndexedDB, goto } from "../../../../../playwright.helper"
import { ViewSwitcherPageObject } from "./viewSwitcher.po"

test.describe("ViewSwitcher", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should show the metric modes only while the tab is hovered", async ({ page }) => {
        // Arrange
        const viewSwitcher = new ViewSwitcherPageObject(page)
        await expect(viewSwitcher.modeBar()).toHaveCount(0)

        // Act
        await viewSwitcher.hoverMetricsTab()

        // Assert
        await expect(viewSwitcher.modeBar()).toBeVisible()
        await expect(page.getByRole("tab", { name: "Explore" })).toBeVisible()
        await expect(page.getByRole("tab", { name: "Compare" })).toBeVisible()
        await expect(page.getByRole("button", { name: "3D Print" })).toBeVisible()

        // Act — the pointer leaves the bar entirely
        await page.mouse.move(700, 700)

        // Assert
        await expect(viewSwitcher.modeBar()).toHaveCount(0)
    })

    test("should pull the mode bar open from the handle below the nav bar", async ({ page }) => {
        // Arrange
        const viewSwitcher = new ViewSwitcherPageObject(page)
        await expect(page.locator("[data-testid=view-mode-bar-handle]")).toBeVisible()

        // Act
        await viewSwitcher.hoverDrawerHandle()

        // Assert — the handle hints at the drawer, so it has to open the same modes as the tab above it
        await expect(viewSwitcher.modeBar()).toBeVisible()
        await expect(page.getByRole("button", { name: "3D Print" })).toBeVisible()
        await expect(page.locator("[data-testid=view-mode-bar-handle]")).toHaveCount(0)
    })

    test("should reach a mode with the pointer travelling down into the floating bar", async ({ page }) => {
        // Arrange
        const viewSwitcher = new ViewSwitcherPageObject(page)
        await viewSwitcher.hoverMetricsTab()

        // Act — hovering the mode first proves the bar survives the seam below the nav bar
        await page.getByRole("tab", { name: "Compare" }).hover()
        await page.getByRole("tab", { name: "Compare" }).click()

        // Assert
        await expect(page.locator("cc-delta-selector")).toBeVisible()
    })

    test("should keep the 3D print dialog open after the mode bar that opened it is gone", async ({ page }) => {
        // Arrange — the sample map boots in a color mode the export refuses, which is the resolvable path
        const viewSwitcher = new ViewSwitcherPageObject(page)
        await viewSwitcher.hoverMetricsTab()

        // Act
        await page.getByRole("button", { name: "3D Print" }).click()
        await page.mouse.move(700, 700)
        await page.getByRole("button", { name: "Change and continue" }).click()

        // Assert
        await expect(viewSwitcher.modeBar()).toHaveCount(0)
        await expect(page.locator("cc-export-3D-map-dialog dialog[open]")).toBeVisible()
    })

    test("should keep the domain tab in compare mode and leave compare mode when it is picked", async ({ page }) => {
        // Arrange
        const viewSwitcher = new ViewSwitcherPageObject(page)
        await viewSwitcher.hoverMetricsTab()
        await page.getByRole("tab", { name: "Compare" }).click()
        await expect(page.locator("cc-delta-selector")).toBeVisible()

        // Act — compare is a mode of the metric view, so the domain view has to be reachable from it
        await expect(page.locator("[data-testid=view-switcher-domain]")).toBeVisible()
        await page.mouse.move(0, 400)
        await viewSwitcher.switchToDomain()

        // Assert
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await expect(page.locator("cc-delta-selector")).toHaveCount(0)
    })
})
