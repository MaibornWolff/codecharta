import { expect, test } from "@playwright/test"
import { CC_URL, clearIndexedDB, goto } from "../../playwright.helper"
import sample1 from "../assets/sample1.cc.json"
import { DomainBarPageObject } from "../features/domainBar/domainBar.po"
import { ViewSwitcherPageObject } from "../features/navBar/components/viewSwitcher/viewSwitcher.po"
import { ExplorerTreeLevelPageObject } from "../features/sidebarExplorer/components/explorerTreeLevel/explorerTreeLevel.po"
import { defaultWordCloudSettings, WordCloudShape } from "../model/wordCloud.model"

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
        // slider's change has round-tripped through the store the word cloud reads its settings from.
        // (That those settings reach the echarts option is asserted in wordCloud.component.spec.ts — the
        // rendered cloud is a canvas, so its layout is not observable from the DOM.)
        await expect(domainBar.topNValue()).toHaveText(`${nonDefaultTopN} words`)
        // Assert the shape actually changed BEFORE the reset — `circle` is the first <option>, so the
        // post-reset assertion below would also hold for a select that was never touched.
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
        // the host element is zero-height (its footer is position:fixed), so assert on the footer
        const pathBar = page.locator("cc-bottom-bar cc-hovered-path")
        await expect(page.locator("cc-bottom-bar footer")).toBeVisible()
        await expect(pathBar).toContainText("root")

        // Act — selecting a node in the explorer drives the cloud even without a 3D map
        await explorer.openFolder("/root/sample1.cc.json")

        // Assert — the status bar follows the selection
        await expect(pathBar).toContainText("sample1.cc.json")
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

    test("should preserve the file query parameter when switching to the domain view and back", async ({ page }) => {
        // Arrange — a deep link, the headline URL contract of the view switch. sample1 carries a domain
        // lens, without which the switcher would not even render.
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
        // The query string is matched loosely around `file=`: once a file is loaded,
        // UpdateQueryParametersEffect -> QueryParamsService.write() also writes the resolved
        // area/height/color back (and `edge`, since sample1 defines edges), exactly as
        // loadPipeline.e2e.ts asserts. What is pinned here is that `file=` SURVIVES the switch and that
        // the router rewrote nothing but the fragment.
        await viewSwitcher.switchToDomain()
        await expect(page).toHaveURL(/\?(?:[^#]*&)?file=fileOne\.json(?:&[^#]*)?#\/domain$/)

        await viewSwitcher.switchToMetrics()
        await expect(page).toHaveURL(/\?(?:[^#]*&)?file=fileOne\.json(?:&[^#]*)?#\/$/)
    })
})
