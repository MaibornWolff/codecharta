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

    test("should search files and folders in the domain view, but without the map-only blacklist rules", async ({ page }) => {
        // Arrange
        const viewSwitcher = new ViewSwitcherPageObject(page)

        // Act
        await viewSwitcher.switchToDomain()

        // Assert
        await expect(page.locator("cc-sidebar-explorer")).toBeVisible()
        await expect(page.locator("cc-sidebar-explorer cc-explorer-search-bar")).toBeVisible()
        await expect(page.locator("cc-sidebar-explorer cc-explorer-search-actions")).toHaveCount(0)
        await expect(page.locator("cc-sidebar-explorer cc-rules-popover")).toHaveCount(0)
    })

    test("should browse the project's words in the explorer, filter them and break one down", async ({ page }) => {
        // Arrange
        const viewSwitcher = new ViewSwitcherPageObject(page)
        await viewSwitcher.switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()

        // Act — the explorer browses files by default, so the words are one toggle away
        await page.getByTestId("explorer-mode-words").click()

        // Assert — the node tree gives way to the word list, which the sort control now orders
        await expect(page.locator("cc-domain-word-list cc-domain-word-row").first()).toBeVisible()
        await expect(page.locator("cc-sidebar-explorer cc-explorer-tree")).toHaveCount(0)
        await expect(page.getByTestId("explorer-sort-trigger")).toContainText("Occurrences")

        // Act — the search box now searches words instead of paths
        const mostFrequentWord = (await page.locator("cc-domain-word-row").first().innerText()).split("\n")[0]
        await page.getByLabel("Search words").fill(mostFrequentWord)

        // Assert
        await expect(page.getByTestId(`domain-word-row-${mostFrequentWord}`)).toBeVisible()

        // Act
        await page.getByTestId(`domain-word-row-${mostFrequentWord}`).click()

        // Assert — the breakdown that used to occupy the right-hand panel now hangs under the word
        await expect(page.locator("cc-domain-word-occurrence-tree [data-testid='domain-word-occurrences-tree']")).toBeVisible()
    })

    test("should reorder the word list from the sort control", async ({ page }) => {
        // Arrange
        const viewSwitcher = new ViewSwitcherPageObject(page)
        await viewSwitcher.switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await page.getByTestId("explorer-mode-words").click()
        await expect(page.locator("cc-domain-word-row").first()).toBeVisible()

        // Act — words open most frequent first, so sorting by name has to move them
        await page.getByTestId("explorer-sort-trigger").click()
        await page.getByRole("button", { name: "Name", exact: true }).click()

        // Assert
        const wordsByName = await page.locator("cc-domain-word-row .node-name").allInnerTexts()
        expect(wordsByName).toEqual([...wordsByName].sort((one, other) => one.localeCompare(other)))
    })

    test("should jump to the metrics view from a node in a word's breakdown", async ({ page }) => {
        // Arrange — a word's breakdown lists nodes, so it offers the node menu the file tree offers
        const viewSwitcher = new ViewSwitcherPageObject(page)
        const metricsExplorer = new ExplorerTreeLevelPageObject(page, "metrics")
        await viewSwitcher.switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await page.getByTestId("explorer-mode-words").click()
        await page.locator("cc-domain-word-row").first().click()
        const occurrence = page.locator("cc-domain-word-occurrence-row").first()
        await expect(occurrence).toBeVisible()
        const occurrenceName = (await occurrence.locator(".node-name").innerText()).trim()

        // Act
        await occurrence.click({ button: "right" })
        await expect(page.locator("#codemap-context-menu")).toBeVisible()
        await page.locator("#codemap-context-menu").getByText("Show in Metrics").click()

        // Assert — the map view is reached with that node picked up as its selection
        await expect(page).toHaveURL(/#\/$/)
        await expect(metricsExplorer.node(`/root/${occurrenceName}`)).toHaveClass(/selected/)
    })

    test("should select a node from the word breakdown, so the cloud scopes to it", async ({ page }) => {
        // Arrange
        const viewSwitcher = new ViewSwitcherPageObject(page)
        await viewSwitcher.switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await page.getByTestId("explorer-mode-words").click()
        await page.locator("cc-domain-word-row").first().click()
        const occurrenceRow = page.locator("cc-domain-word-occurrence-row").first()
        await expect(occurrenceRow).toBeVisible()
        const occurrenceName = (await occurrenceRow.locator(".node-name").innerText()).trim()

        // Act — the breakdown's rows are explorer rows, so a click selects the node
        await occurrenceRow.click()

        // Assert
        await expect(page.locator("cc-bottom-bar cc-hovered-path [data-testid='hovered-path-current']")).toHaveText(occurrenceName)
        await expect(occurrenceRow.locator(".selected")).toBeVisible()
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
        const explorer = new ExplorerTreeLevelPageObject(page, "domain")
        await viewSwitcher.switchToDomain()
        const currentCrumb = page.locator("cc-bottom-bar cc-hovered-path [data-testid='hovered-path-current']")
        await expect(page.locator("cc-bottom-bar footer")).toBeVisible()
        await expect(currentCrumb).toHaveText("root")

        // Act — selecting a node in the explorer drives the cloud even without a 3D map
        await explorer.openFolder("/root/sample1.cc.json")

        // Assert — the status bar follows the selection
        await expect(currentCrumb).toHaveText("sample1.cc.json")
    })

    test("should keep the map modes in the metric tab's mode bar while the domain view is shown", async ({ page }) => {
        // Arrange — the mode bar only exists while a tab is hovered, so nothing but settings sits in the bar
        const viewSwitcher = new ViewSwitcherPageObject(page)
        const modeToggle = page.locator("cc-mode-toggle")
        const print3DButton = page.getByRole("button", { name: "3D Print" })
        await expect(page.locator("cc-settings-button")).toBeVisible()
        await expect(modeToggle).toHaveCount(0)

        // Act
        await viewSwitcher.switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await viewSwitcher.hoverMetricsTab()

        // Assert — the metric modes stay reachable, and the export offers the metric view it needs
        // rather than sitting there dead
        await expect(modeToggle).toBeVisible()
        await expect(print3DButton).toBeEnabled()
        await print3DButton.click()
        await expect(page.getByRole("button", { name: "Switch and continue" })).toBeVisible()
        await page.getByRole("button", { name: "Stay here" }).click()

        // Act — the round trip is the point: the route-reuse strategy keeps both views alive
        await viewSwitcher.switchToMetrics()
        await viewSwitcher.hoverMetricsTab()

        // Assert
        await expect(modeToggle).toBeVisible()
        await expect(print3DButton).toBeEnabled()
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
    test("should jump from a node in the domain explorer to the metrics view", async ({ page }) => {
        // Arrange
        const viewSwitcher = new ViewSwitcherPageObject(page)
        const domainExplorer = new ExplorerTreeLevelPageObject(page, "domain")
        const metricsExplorer = new ExplorerTreeLevelPageObject(page, "metrics")
        await viewSwitcher.switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()

        // Act
        await domainExplorer.openContextMenu("/root")
        await page.locator("#codemap-context-menu").getByText("Show in Metrics").click()

        // Assert — the map view is reached with the node picked up as its selection
        await expect(page).toHaveURL(/#\/$/)
        await expect(metricsExplorer.node("/root")).toHaveClass(/selected/)
    })

    test("should put the explorer back on its file tree when a node is handed over to the domain view", async ({ page }) => {
        // Arrange — the domain explorer is left browsing words, where no node row exists
        const viewSwitcher = new ViewSwitcherPageObject(page)
        const domainExplorer = new ExplorerTreeLevelPageObject(page, "domain")
        const metricsExplorer = new ExplorerTreeLevelPageObject(page, "metrics")
        await viewSwitcher.switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await page.getByTestId("explorer-mode-words").click()
        await expect(page.locator("cc-domain-word-row").first()).toBeVisible()
        await viewSwitcher.switchToMetrics()

        // Act
        await metricsExplorer.openContextMenu("/root")
        await page.locator("#codemap-context-menu").getByText("Show in Domain").click()

        // Assert — the handed-over node is on screen, not hidden behind the word list
        await expect(page).toHaveURL(/#\/domain$/)
        await expect(page.getByTestId("explorer-mode-files")).toHaveAttribute("aria-pressed", "true")
        await expect(domainExplorer.node("/root")).toHaveClass(/selected/)
    })

    test("should jump back to the domain view from the node it was left on", async ({ page }) => {
        // Arrange — the user jumped to the metrics view from the domain explorer, which leaves the
        // domain view kept alive off screen with the menu it had rendered
        const viewSwitcher = new ViewSwitcherPageObject(page)
        const domainExplorer = new ExplorerTreeLevelPageObject(page, "domain")
        const metricsExplorer = new ExplorerTreeLevelPageObject(page, "metrics")
        await viewSwitcher.switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await domainExplorer.openContextMenu("/root")
        await page.locator("#codemap-context-menu").getByText("Show in Metrics").click()
        await expect(page).toHaveURL(/#\/$/)

        // Act
        await metricsExplorer.openContextMenu("/root")
        await page.locator("#codemap-context-menu").getByText("Show in Domain").click()

        // Assert — the menu of the view on screen acts, rather than being closed by the one the
        // router is keeping alive off screen
        await expect(page).toHaveURL(/#\/domain$/)
        await expect(domainExplorer.node("/root")).toHaveClass(/selected/)
    })
})
