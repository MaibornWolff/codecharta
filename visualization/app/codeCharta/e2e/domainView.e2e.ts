import { expect, type Page, test } from "@playwright/test"
import { CC_URL, clearIndexedDB, collapseExplorer, goto, waitForCcStatePersisted } from "../../playwright.helper"
import sample1 from "../assets/sample1.cc.json"
import { DomainBarPageObject } from "../features/domainBar/domainBar.po"
import { NavBarFolderButtonPageObject } from "../features/navBar/components/navBarFolderButton/navBarFolderButton.po"
import { ViewSwitcherPageObject } from "../features/navBar/components/viewSwitcher/viewSwitcher.po"
import { ExplorerTreeLevelPageObject } from "../features/sidebarExplorer/components/explorerTreeLevel/explorerTreeLevel.po"
import { defaultWordCloudSettings, WordCloudShape } from "../model/wordCloud.model"

// The persisted record keys files by their file name, which is not what the map selector shows for
// the boot pair ("sample1 +1").
const BOOT_SAMPLE_FILE_NAME = "sample1.cc.json"

// The cloud debounces its render and then lays the words out asynchronously.
const WORD_CLOUD_LAYOUT_MS = 2500

const MANY_WORDS_FILE = "./app/codeCharta/resources/sample_with_many_domain_words.cc.json"

// A screenful plus the window's overscan — far fewer than the 300 words the file carries, and loose
// enough to survive a row's worth of chrome moving in or out of the panel.
const MOST_ROWS_A_WINDOW_RENDERS = 40

/** The cloud fills its centre and leaves the corners bare, so the top left corner is empty canvas.
 * The toolbox sits in the opposite corner, out of the way. */
async function clickBesideEveryWord(page: Page) {
    const cloud = await page.locator("cc-word-cloud canvas").boundingBox()
    if (!cloud) {
        throw new Error("The word cloud has not been laid out")
    }
    await page.mouse.click(cloud.x + 4, cloud.y + 4)
}

/** The cloud lays its largest word out at the centre, which is the only word a test can aim at. */
async function clickTheLargestWord(page: Page, button: "left" | "right" = "left") {
    const cloud = await page.locator("cc-word-cloud canvas").boundingBox()
    if (!cloud) {
        throw new Error("The word cloud has not been laid out")
    }
    await page.mouse.click(cloud.x + cloud.width / 2, cloud.y + cloud.height / 2, { button })
}

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

    test("should show the occurrences of a word clicked in the cloud, from the file tree too", async ({ page }) => {
        // Arrange — the explorer is on its file tree, which is where it opens.
        await new ViewSwitcherPageObject(page).switchToDomain()
        const canvas = page.locator("cc-word-cloud canvas")
        await expect(canvas).toBeVisible()
        await page.waitForTimeout(WORD_CLOUD_LAYOUT_MS)

        // Act — the cloud lays its largest word out at the centre.
        await clickTheLargestWord(page)

        // Assert — the click opens the word: word mode, pinned, broken down. The search box is left
        // alone, so the rest of the list stays in reach.
        await expect(page.getByTestId("explorer-mode-words")).toHaveAttribute("aria-pressed", "true")
        await expect(page.locator("cc-domain-word-occurrence-tree")).toHaveCount(1)
        await expect(page.locator("cc-domain-word-row").first()).toBeVisible()
        await expect(page.getByLabel("Search words")).toHaveValue("")
    })

    test("should search for a word from its cloud menu, without pinning it", async ({ page }) => {
        // Arrange — the explorer opens on its file tree, where the search box filters paths
        await new ViewSwitcherPageObject(page).switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await page.waitForTimeout(WORD_CLOUD_LAYOUT_MS)

        // Act
        await clickTheLargestWord(page, "right")
        await expect(page.getByTestId("domain-word-menu")).toBeVisible()
        const menuWord = (await page.getByTestId("domain-word-menu-copy").innerText()).trim()
        await page.getByText("Search word").click()

        // Assert — the word lands in the word search, and nothing is pinned by it
        await expect(page.getByTestId("explorer-mode-words")).toHaveAttribute("aria-pressed", "true")
        await expect(page.getByLabel("Search words")).toHaveValue(menuWord)
        await expect(page.getByTestId("domain-word-pin")).toHaveCount(0)
        await expect(page.getByTestId(`domain-word-row-${menuWord}`)).toBeVisible()
    })

    test("should drop a hidden word from the cloud and the word list, and bring it back", async ({ page }) => {
        // Arrange — word mode open beside a settled cloud.
        await new ViewSwitcherPageObject(page).switchToDomain()
        await page.getByTestId("explorer-mode-words").click()
        await expect(page.locator("cc-domain-word-row").first()).toBeVisible()
        const wordCountBeforeHiding = await page.locator("cc-domain-word-row").count()
        await page.waitForTimeout(WORD_CLOUD_LAYOUT_MS)

        // Act — hide the largest word through the cloud's word menu.
        await clickTheLargestWord(page, "right")
        await expect(page.getByTestId("domain-word-menu")).toBeVisible()
        const hiddenWord = (await page.getByTestId("domain-word-menu-copy").innerText()).trim()
        await page.getByText("Hide word").click()

        // Assert — the word left the list, and the explorer's chip counts it.
        await expect(page.locator("cc-domain-word-row")).toHaveCount(wordCountBeforeHiding - 1)
        await expect(page.locator("cc-explorer-count-chip")).toContainText("1")

        // Act — bring it back from the chip.
        await page.locator("cc-explorer-count-chip button").click()
        await page.getByTestId(`domain-restore-${hiddenWord}`).click()

        // Assert
        await expect(page.locator("cc-domain-word-row")).toHaveCount(wordCountBeforeHiding)
    })

    test("should render only the visible slice of a long word list", async ({ page }) => {
        // Arrange — a project with 300 words, opened the way a reader would: the view first, its word
        // list a moment later. Attaching to the panel before it exists is what made every row render.
        await new NavBarFolderButtonPageObject(page).openFiles([MANY_WORDS_FILE])
        await new ViewSwitcherPageObject(page).switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await page.waitForTimeout(WORD_CLOUD_LAYOUT_MS)

        // Act
        await page.getByTestId("explorer-mode-words").click()
        await expect(page.locator("cc-domain-word-row").first()).toBeVisible()

        // Assert — a fraction of the 300 rows is rendered, while the panel still scrolls the whole list.
        const renderedRows = await page.locator("cc-domain-word-row").count()
        expect(renderedRows).toBeGreaterThan(0)
        expect(renderedRows).toBeLessThan(MOST_ROWS_A_WINDOW_RENDERS)
        const panel = page.locator("cc-sidebar-explorer .overflow-auto")
        expect(await panel.evaluate(element => element.scrollHeight)).toBeGreaterThan(300 * 20)
    })

    test("should pin the word clicked in the cloud above a long list, without narrowing the list", async ({ page }) => {
        // Arrange — 300 words, the list scrolled away from the one the cloud draws largest.
        await new NavBarFolderButtonPageObject(page).openFiles([MANY_WORDS_FILE])
        await new ViewSwitcherPageObject(page).switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await page.waitForTimeout(WORD_CLOUD_LAYOUT_MS)
        await page.getByTestId("explorer-mode-words").click()
        await expect(page.locator("cc-domain-word-row").first()).toBeVisible()
        const largestWord = (await page.locator("cc-domain-word-row").first().innerText()).split("\n")[0]
        const panel = page.locator("cc-sidebar-explorer .overflow-auto")
        await panel.evaluate(element => element.scrollTo(0, 4000))
        await expect(page.getByTestId(`domain-word-row-${largestWord}`)).toHaveCount(0)

        // Act
        await clickTheLargestWord(page)

        // Assert — the word sits in the pin, in sight even though the list stayed scrolled down, and
        // the rest of the list is still there to scroll through
        const pin = page.getByTestId("domain-word-pin")
        await expect(pin.getByTestId(`domain-word-row-${largestWord}`)).toBeVisible()
        await expect(pin.locator("cc-domain-word-occurrence-tree")).toBeVisible()
        await expect(page.getByLabel("Search words")).toHaveValue("")
        expect(await page.locator("cc-domain-word-row").count()).toBeGreaterThan(1)
    })

    test("should keep rendering only a slice after the explorer is collapsed and re-opened", async ({ page }) => {
        // Arrange — collapsing destroys the panel the list measures itself against.
        await new NavBarFolderButtonPageObject(page).openFiles([MANY_WORDS_FILE])
        await new ViewSwitcherPageObject(page).switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await page.waitForTimeout(WORD_CLOUD_LAYOUT_MS)
        await page.getByTestId("explorer-mode-words").click()
        await expect(page.locator("cc-domain-word-row").first()).toBeVisible()

        // Act
        await collapseExplorer(page)
        await page.getByTestId("explorer-expand-button").click()

        // Assert
        const renderedRows = await page.locator("cc-domain-word-row").count()
        expect(renderedRows).toBeGreaterThan(0)
        expect(renderedRows).toBeLessThan(MOST_ROWS_A_WINDOW_RENDERS)
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

    test("should let the word and the node go when the cloud is clicked beside every word", async ({ page }) => {
        // Arrange — a word broken down and the cloud scoped to a node below it
        await new ViewSwitcherPageObject(page).switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await page.getByTestId("explorer-mode-words").click()
        await page.locator("cc-domain-word-row").first().click()
        await page.locator("cc-domain-word-occurrence-row").first().click()
        const currentCrumb = page.locator("cc-bottom-bar cc-hovered-path [data-testid='hovered-path-current']")
        await expect(currentCrumb).not.toHaveText("root")
        await page.waitForTimeout(WORD_CLOUD_LAYOUT_MS)

        // Act
        await clickBesideEveryWord(page)

        // Assert — the breakdown closes and the cloud is back on the whole project
        await expect(page.locator("cc-domain-word-occurrence-tree")).toHaveCount(0)
        await expect(currentCrumb).toHaveText("root")
    })

    test("should keep a word the search matched marked after the cloud is clicked beside every word", async ({ page }) => {
        // Arrange — a search the reader typed, which only the search box itself may clear
        await new ViewSwitcherPageObject(page).switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await page.getByTestId("explorer-mode-words").click()
        const searchedWord = (await page.locator("cc-domain-word-row").first().innerText()).split("\n")[0]
        await page.getByLabel("Search words").fill(searchedWord)
        await expect(page.locator("cc-domain-word-row")).toHaveCount(1)
        await page.waitForTimeout(WORD_CLOUD_LAYOUT_MS)

        // Act
        await clickBesideEveryWord(page)

        // Assert — the click takes nothing away from the search box
        await expect(page.getByLabel("Search words")).toHaveValue(searchedWord)
        await expect(page.locator("cc-domain-word-row")).toHaveCount(1)
    })

    test("should keep the pinned word in sight while a search filters the list below it", async ({ page }) => {
        // Arrange — a word opened from the cloud, which the search about to be typed does not match
        await new ViewSwitcherPageObject(page).switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await page.waitForTimeout(WORD_CLOUD_LAYOUT_MS)
        await clickTheLargestWord(page)
        const pin = page.getByTestId("domain-word-pin")
        const pinnedWord = (await pin.locator("cc-domain-word-row .node-name").innerText()).trim()

        // Act — a search that cannot match the pinned word
        await page.getByLabel("Search words").fill("pay")

        // Assert — the pin survives the filter, and the word is not listed a second time below it
        await expect(pin.getByTestId(`domain-word-row-${pinnedWord}`)).toBeVisible()
        await expect(page.locator(`cc-domain-word-row[data-testid='domain-word-row-${pinnedWord}']`)).toHaveCount(1)
        await expect(page.getByLabel("Search words")).toHaveValue("pay")
    })

    test("should replace the pinned word with one picked from the list below it", async ({ page }) => {
        // Arrange
        await new ViewSwitcherPageObject(page).switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await page.waitForTimeout(WORD_CLOUD_LAYOUT_MS)
        await clickTheLargestWord(page)
        const pin = page.getByTestId("domain-word-pin")
        const firstPinned = (await pin.locator("cc-domain-word-row .node-name").innerText()).trim()
        const nextWord = (
            await page.locator(`cc-domain-word-row:not([data-testid='domain-word-row-${firstPinned}']) .node-name`).first().innerText()
        ).trim()

        // Act
        await page.getByTestId(`domain-word-row-${nextWord}`).click()

        // Assert — the new word takes the pin and the old one drops back into the list
        await expect(pin.getByTestId(`domain-word-row-${nextWord}`)).toBeVisible()
        await expect(pin.getByTestId(`domain-word-row-${firstPinned}`)).toHaveCount(0)
        await expect(page.getByTestId(`domain-word-row-${firstPinned}`)).toBeVisible()
    })

    test("should let the pinned word go from its unpin button, leaving the search alone", async ({ page }) => {
        // Arrange
        await new ViewSwitcherPageObject(page).switchToDomain()
        await expect(page.locator("cc-word-cloud canvas")).toBeVisible()
        await page.waitForTimeout(WORD_CLOUD_LAYOUT_MS)
        await clickTheLargestWord(page)
        await page.getByLabel("Search words").fill("pay")
        await expect(page.getByTestId("domain-word-pin")).toBeVisible()

        // Act
        await page.getByTestId("domain-word-unpin").click()

        // Assert
        await expect(page.getByTestId("domain-word-pin")).toHaveCount(0)
        await expect(page.getByLabel("Search words")).toHaveValue("pay")
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
