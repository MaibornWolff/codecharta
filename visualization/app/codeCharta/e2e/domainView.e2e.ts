import { expect, test } from "@playwright/test"
import { CC_URL, clearIndexedDB, goto, waitForCcStatePersisted } from "../../playwright.helper"
import sample1 from "../assets/sample1.cc.json"
import { DomainBarPageObject } from "../features/domainBar/domainBar.po"
import { ViewSwitcherPageObject } from "../features/navBar/components/viewSwitcher/viewSwitcher.po"
import { ExplorerTreeLevelPageObject } from "../features/sidebarExplorer/components/explorerTreeLevel/explorerTreeLevel.po"
import { defaultWordCloudSettings, WordCloudShape } from "../model/wordCloud.model"

// The persisted record keys files by their file name, which is not what the map selector shows for
// the boot pair ("sample1 +1").
const BOOT_SAMPLE_FILE_NAME = "sample1.cc.json"

test.describe("DomainView", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should switch to the domain view and render the word cloud", async ({ page }) => {
        // Arrange
        const viewSwitcher = new ViewSwitcherPageObject(page)

        // Act
        await viewSwitcher.switchToDomain()

        // Assert
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await expect(page.locator("cc-domain-bar")).toBeVisible()
    })

    test("should render the explorer without the rules popovers and search bar in the domain view", async ({ page }) => {
        // Arrange
        const viewSwitcher = new ViewSwitcherPageObject(page)

        // Act
        await viewSwitcher.switchToDomain()

        // Assert
        await expect(page.locator("cc-sidebar-explorer")).toBeVisible()
        await expect(page.locator("cc-sidebar-explorer cc-explorer-search-bar")).toHaveCount(0)
        await expect(page.locator("cc-sidebar-explorer cc-rules-popover")).toHaveCount(0)
    })

    test("should apply a settings change from the domain bar to the state that drives the cloud", async ({ page }) => {
        // Arrange — a top-N that is neither the default nor the slider's min/max
        const nonDefaultTopN = 30
        const viewSwitcher = new ViewSwitcherPageObject(page)
        const domainBar = new DomainBarPageObject(page)
        await viewSwitcher.switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()

        // Act
        await domainBar.selectShape(WordCloudShape.star)
        await domainBar.setTopN(nonDefaultTopN)

        // Assert — the badge is rendered FROM the domainBar store, so it only shows the new value once the
        await expect(domainBar.topNValue()).toHaveText(`${nonDefaultTopN} words`)
        // Assert the shape actually changed BEFORE the reset — `circle` is the first <option>, so the
        await expect(domainBar.shapeSelect()).toHaveValue(WordCloudShape.star)
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()

        // Act — each popover resets only its own group, so both are reset here
        await domainBar.resetWordSizing()
        await domainBar.resetShape()

        // Assert
        await expect(domainBar.topNValue()).toHaveText(`${defaultWordCloudSettings.topN} words`)
        await expect(domainBar.shapeSelect()).toHaveValue(defaultWordCloudSettings.shape)
    })

    test("should keep the metrics map rendered after switching to domain and back", async ({ page }) => {
        // Arrange
        const viewSwitcher = new ViewSwitcherPageObject(page)
        await expect(page.locator("#codeMapScene")).toBeVisible()

        // Act — round-trip through the domain view
        await viewSwitcher.switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await viewSwitcher.switchToMetrics()

        // Assert — the kept-alive map view comes back with a sized canvas (not an empty one)
        const canvas = page.locator("#codeMapScene")
        await expect(canvas).toBeVisible()
        const box = await canvas.boundingBox()
        expect(box?.width ?? 0).toBeGreaterThan(0)
        expect(box?.height ?? 0).toBeGreaterThan(0)
    })

    test("should reuse the map's bottom bar and reflect the explorer selection in it", async ({ page }) => {
        // Arrange — the domain view reuses cc-bottom-bar, showing the selected node (no map to hover)
        const viewSwitcher = new ViewSwitcherPageObject(page)
        const explorer = new ExplorerTreeLevelPageObject(page)
        await viewSwitcher.switchToDomain()
        const currentCrumb = page.locator("cc-bottom-bar cc-hovered-path [data-testid='hovered-path-current']")
        await expect(page.locator("cc-bottom-bar footer")).toBeVisible()
        await expect(currentCrumb).toHaveText("root")

        // Act — selecting a node in the explorer drives the cloud even without a 3D map
        await explorer.openFolder("/root/sample1.cc.json")

        // Assert — the status bar follows the selection
        await expect(currentCrumb).toHaveText("sample1.cc.json")
    })

    test("should hide the map-only nav bar controls on the domain view and restore them on the way back", async ({ page }) => {
        // Arrange — 3D print exports the code map's geometry and the mode toggle drives delta mode, so
        const viewSwitcher = new ViewSwitcherPageObject(page)
        const modeToggle = page.locator("cc-mode-toggle")
        const print3DButton = page.locator("cc-print-3d-button")
        const settingsButton = page.locator("cc-settings-button")
        await expect(modeToggle).toBeVisible()
        await expect(print3DButton).toBeVisible()

        // Act
        await viewSwitcher.switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()

        // Assert
        await expect(modeToggle).toHaveCount(0)
        await expect(print3DButton).toHaveCount(0)
        await expect(settingsButton).toBeVisible()

        // Act — the round trip is the point: the route-reuse strategy keeps both views alive, so the nav
        await viewSwitcher.switchToMetrics()

        // Assert
        await expect(modeToggle).toBeVisible()
        await expect(print3DButton).toBeVisible()
        await expect(settingsButton).toBeVisible()
    })

    test("should route to the domain path and back to the metrics path", async ({ page }) => {
        // Arrange
        const viewSwitcher = new ViewSwitcherPageObject(page)

        // Act & Assert — the router owns the fragment (hash location, see app.config)
        await viewSwitcher.switchToDomain()
        await expect(page).toHaveURL(/#\/domain$/)

        await viewSwitcher.switchToMetrics()
        await expect(page).toHaveURL(/#\/$/)
    })

    test("should stay on the domain view when the page is refreshed on it", async ({ page }) => {
        // Arrange — the domain view is on screen and its state has actually reached IndexedDB (the save is
        const viewSwitcher = new ViewSwitcherPageObject(page)
        await viewSwitcher.switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await waitForCcStatePersisted(page, BOOT_SAMPLE_FILE_NAME)

        // Act
        await page.reload()

        // Assert — the restored session comes back on the domain view, not bounced to the map
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await expect(page).toHaveURL(/#\/domain$/)
        await expect(page.getByText("This file has no domain-language data")).toHaveCount(0)
    })

    test("should preserve the file query parameter when switching to the domain view and back", async ({ page }) => {
        // Arrange — a deep link, the headline URL contract of the view switch. sample1 carries a domain
        const viewSwitcher = new ViewSwitcherPageObject(page)
        await page.route("**/fileOne.json", route =>
            route.fulfill({
                contentType: "application/json",
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify(sample1)
            })
        )
        await goto(page, `${CC_URL}?file=fileOne.json`)
        await expect(page.locator("#codeMapScene")).toBeVisible()

        // Act & Assert — the router owns only the fragment, so the query string precedes it on both legs.
        await viewSwitcher.switchToDomain()
        await expect(page).toHaveURL(/\?(?:[^#]*&)?file=fileOne\.json(?:&[^#]*)?#\/domain$/)

        await viewSwitcher.switchToMetrics()
        await expect(page).toHaveURL(/\?(?:[^#]*&)?file=fileOne\.json(?:&[^#]*)?#\/$/)
    })

    test("should download a png of the word cloud from the domain toolbox", async ({ page }) => {
        // Arrange
        const viewSwitcher = new ViewSwitcherPageObject(page)
        await viewSwitcher.switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()

        // Act
        const download = page.waitForEvent("download")
        await page.locator("cc-domain-toolbox button[aria-label='Screenshot']").click()

        // Assert — the domain suffix distinguishes it from the metrics view's "_map" screenshot
        expect((await download).suggestedFilename()).toMatch(/_domain\.png$/)
    })

    test("should take the word-cloud screenshot on the Ctrl+Alt+S hotkey", async ({ page }) => {
        // Arrange
        const viewSwitcher = new ViewSwitcherPageObject(page)
        await viewSwitcher.switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()

        // Act
        const download = page.waitForEvent("download")
        await page.keyboard.press("Control+Alt+KeyS")

        // Assert — the kept-alive metrics view holds a binding for the same hotkey, so this also pins
        expect((await download).suggestedFilename()).toMatch(/_domain\.png$/)
    })
})
