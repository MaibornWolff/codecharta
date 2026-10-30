import { expect, Page, test } from "@playwright/test"
import { clearIndexedDB, goto } from "../../playwright.helper"
import { LocalSourcePageObject } from "../features/localSource/e2e/localSource.po"
import { ViewSwitcherPageObject } from "../features/navBar/components/viewSwitcher/viewSwitcher.po"
import { ExplorerTreeLevelPageObject } from "../features/sidebarExplorer/components/explorerTreeLevel/explorerTreeLevel.po"

const SAMPLE_ONE = "/root/sample1.cc.json"
const BIG_LEAF = `${SAMPLE_ONE}/bigLeaf.ts`

test.describe("Local source and the browser's back button", () => {
    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    /** Without an earlier view in the tab's history, going back would leave CodeCharta. */
    async function askForTheSourceAfterVisitingTheDomainView(page: Page) {
        const localSource = new LocalSourcePageObject(page)
        await localSource.standInForThePicker("sampleFolder")
        await goto(page)
        const viewSwitcher = new ViewSwitcherPageObject(page)
        await viewSwitcher.switchToDomain()
        await viewSwitcher.switchToMetrics()
        await localSource.switchOn()
        const explorer = new ExplorerTreeLevelPageObject(page)
        await explorer.openFolder(SAMPLE_ONE)
        await explorer.openContextMenu(BIG_LEAF)
        await page.locator("#codemap-context-menu").getByText("Show Source").click()
        return localSource
    }

    test("should return to the map on the same view when the browser goes back from the source", async ({ page }) => {
        // Arrange
        const localSource = await askForTheSourceAfterVisitingTheDomainView(page)
        await localSource.selectFolderInTheDialog()
        await expect(localSource.sourceDialog()).toBeVisible()
        const urlOfTheMap = page.url()

        // Act
        await page.goBack()

        // Assert
        await expect(localSource.sourceDialog()).toBeHidden()
        expect(page.url()).toBe(urlOfTheMap)
        await page.goForward()
        await expect(localSource.sourceDialog()).toBeHidden()
        expect(page.url()).toBe(urlOfTheMap)
    })

    test("should take the history entry of the source away again when its button closes it", async ({ page }) => {
        // Arrange
        const localSource = await askForTheSourceAfterVisitingTheDomainView(page)
        await localSource.selectFolderInTheDialog()
        await page.getByTestId("source-viewer-back").click()
        await expect(localSource.sourceDialog()).toBeHidden()

        // Act
        await page.goBack()

        // Assert
        await expect(page).toHaveURL(/#\/domain$/)
    })

    test("should close a dialog open in the view the browser leaves, and not bring it back", async ({ page }) => {
        // Arrange
        const localSource = await askForTheSourceAfterVisitingTheDomainView(page)
        await expect(localSource.folderDialog()).toBeVisible()

        // Act
        await page.goBack()
        await expect(page).toHaveURL(/#\/domain$/)
        await page.goForward()
        await expect(page).toHaveURL(/#\/$/)

        // Assert
        await expect(localSource.folderDialog()).toHaveCount(0)
    })
})
