import { readFile } from "node:fs/promises"
import { expect, test } from "@playwright/test"
import { clearIndexedDB, goto, readPersistedPreference } from "../../playwright.helper"
import { ViewSwitcherPageObject } from "../features/navBar/components/viewSwitcher/viewSwitcher.po"
import { ExplorerTreeLevelPageObject } from "../features/sidebarExplorer/components/explorerTreeLevel/explorerTreeLevel.po"

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

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
        await expect(viewSwitcher.dependenciesTab()).toBeVisible()

        // Act
        await viewSwitcher.switchToDependencies()

        // Assert
        await expect(page.getByTestId("dependency-graph").locator("canvas")).toBeVisible()
        await expect(page.getByText("No file in view carries dependency levels.")).toHaveCount(0)
    })

    test("should save a screenshot of only the folder the reader right-clicked", async ({ page }) => {
        // Arrange
        await new ViewSwitcherPageObject(page).switchToDependencies()
        await expect(page.getByTestId("dependency-graph").locator("canvas")).toBeVisible()
        const explorer = new ExplorerTreeLevelPageObject(page, "dependencies")
        await explorer.openFolder("/root/sample1.cc.json")
        await explorer.openContextMenu("/root/sample1.cc.json/ParentLeaf")

        // Act
        const download = page.waitForEvent("download")
        await page.locator("#codemap-context-menu").getByText("Screenshot Folder").click()
        const screenshot = await download

        // Assert
        expect(screenshot.suggestedFilename()).toMatch(/_dependencies_ParentLeaf\.png$/)
        const png = await readFile(await screenshot.path())
        expect(png.subarray(0, PNG_SIGNATURE.length)).toEqual(PNG_SIGNATURE)
        await expect(page.getByText('Screenshot of "ParentLeaf" saved')).toBeVisible()
    })

    test("should keep the hover highlight switched off once the reader turns it off, also after a reload", async ({ page }) => {
        // Arrange
        await new ViewSwitcherPageObject(page).switchToDependencies()
        await page.getByTestId("dependency-bar-edges-segment").locator("button[popovertarget]").first().click()

        // Act
        await page.getByTestId("dependency-bar-edges-highlight-on-hover").uncheck()

        // Assert
        await expect(page.getByTestId("dependency-bar-edges-respect-on-hover")).toBeDisabled()
        await expect(page.getByTestId("dependency-bar-edges-hover-note")).toContainText("looks like every other box")
        await expect
            .poll(
                async () =>
                    ((await readPersistedPreference(page, "dependencyGraph")) as { isHoverHighlighted?: boolean })?.isHoverHighlighted
            )
            .toBe(false)
        await goto(page)
        await new ViewSwitcherPageObject(page).switchToDependencies()
        await page.getByTestId("dependency-bar-edges-segment").locator("button[popovertarget]").first().click()
        await expect(page.getByTestId("dependency-bar-edges-highlight-on-hover")).not.toBeChecked()
    })
})
