import { expect, test } from "@playwright/test"
import { clearIndexedDB, goto } from "../../../../playwright.helper"
import { ExplorerTreeLevelPageObject } from "../../sidebarExplorer/components/explorerTreeLevel/explorerTreeLevel.po"
import { LocalSourcePageObject } from "./localSource.po"

const SAMPLE_ONE = "/root/sample1.cc.json"
const BIG_LEAF = `${SAMPLE_ONE}/bigLeaf.ts`
const BLOCKED_MESSAGE = "This browser does not let CodeCharta open local folders here"

test.describe("Local source", () => {
    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    async function openMenuOf(page: Parameters<typeof goto>[0], path: string) {
        const explorer = new ExplorerTreeLevelPageObject(page)
        if ((await page.locator(`[id='metrics:${BIG_LEAF}']`).count()) === 0) {
            await explorer.openFolder(SAMPLE_ONE)
        }
        await explorer.openContextMenu(path)
        return page.locator("#codemap-context-menu")
    }

    test("should offer no local source until the reader switches it on", async ({ page }) => {
        // Arrange
        await new LocalSourcePageObject(page).standInForThePicker("sampleFolder")
        await goto(page)

        // Act
        const menu = await openMenuOf(page, BIG_LEAF)

        // Assert
        await expect(menu.getByText("Show Source")).toHaveCount(0)
        await expect(menu.getByText("Open in VS Code")).toHaveCount(0)
    })

    test("should show a file from the folder chosen for its map, coloured by its language", async ({ page }) => {
        // Arrange
        const localSource = new LocalSourcePageObject(page)
        await localSource.standInForThePicker("sampleFolder")
        await goto(page)
        await localSource.switchOn()

        // Act
        await (await openMenuOf(page, BIG_LEAF)).getByText("Show Source").click()
        await localSource.selectFolderInTheDialog()

        // Assert
        await expect(localSource.sourceDialog()).toBeVisible()
        await expect(localSource.sourceDialog()).toContainText("bigLeaf.ts")
        await expect(localSource.sourceDialog()).toContainText("console.log(big)")
        await expect(localSource.sourceDialog().locator(".token.keyword").first()).toHaveText("export")
    })

    test("should show the text cursor over the code and keep a selection dragged past a line's end on that line", async ({ page }) => {
        // Arrange
        const localSource = new LocalSourcePageObject(page)
        await localSource.standInForThePicker("sampleFolder")
        await goto(page)
        await localSource.switchOn()
        await (await openMenuOf(page, BIG_LEAF)).getByText("Show Source").click()
        await localSource.selectFolderInTheDialog()
        const firstLine = localSource.sourceDialog().locator(".cc-source-code").first()
        await expect(firstLine).toHaveText("export const big = 1")
        const box = await firstLine.boundingBox()
        const cursorOverTheCode = await firstLine.evaluate(code => getComputedStyle(code).cursor)

        // Act
        await page.mouse.move(box.x + 20, box.y + box.height / 2)
        await page.mouse.down()
        await page.mouse.move(box.x + box.width - 5, box.y + box.height / 2 + 2, { steps: 10 })
        await page.mouse.up()

        // Assert
        expect(cursorOverTheCode).toBe("text")
        expect(await page.evaluate(() => window.getSelection().toString())).toMatch(/^[^\n]*= 1$/)
    })

    test("should mark a clicked line, wrap lines on request and go back to the map", async ({ page }) => {
        // Arrange
        const localSource = new LocalSourcePageObject(page)
        await localSource.standInForThePicker("sampleFolder")
        await goto(page)
        await localSource.switchOn()
        await (await openMenuOf(page, BIG_LEAF)).getByText("Show Source").click()
        await localSource.selectFolderInTheDialog()

        // Act
        await localSource.sourceDialog().locator(".cc-source-number").nth(1).click()
        await page.getByTestId("source-viewer-wrap").click()
        const statusLine = await page.getByTestId("source-viewer-line").innerText()
        const wraps = await localSource
            .sourceDialog()
            .locator(".cc-source")
            .evaluate(viewer => viewer.classList.contains("cc-source-wraps"))
        await page.getByTestId("source-viewer-back").click()

        // Assert
        expect(statusLine).toBe("Ln 2")
        expect(wraps).toBe(true)
        await expect(localSource.sourceDialog()).toBeHidden()
    })

    test("should open a file in VS Code once the folder's full path was entered", async ({ page }) => {
        // Arrange
        const localSource = new LocalSourcePageObject(page)
        await localSource.standInForThePicker("sampleFolder")
        await goto(page)
        await localSource.switchOn()

        // Act
        await (await openMenuOf(page, BIG_LEAF)).getByText("Open in VS Code").click()
        await localSource.editorDialog().locator("input").fill("C:\\dev\\sample1")
        await localSource.editorDialog().getByRole("button", { name: "Open" }).click()

        // Assert
        expect(await localSource.openedLinks()).toEqual(["vscode://file/C:/dev/sample1/bigLeaf.ts"])
        expect(await localSource.blankTabs()).toEqual([])
        await localSource.openMapSelector()
        await expect(page.getByTestId("map-local-folder-name").first()).toContainText("not set")
        await expect(page.getByTestId("map-local-folder-editor-path").first()).toContainText("C:\\dev\\sample1")
    })

    test("should show each map's local folder in the map selector once it is set", async ({ page }) => {
        // Arrange
        const localSource = new LocalSourcePageObject(page)
        await localSource.standInForThePicker("sampleFolder")
        await goto(page)
        await localSource.switchOn()

        // Act
        await (await openMenuOf(page, SAMPLE_ONE)).getByText("Set Local Folder…").click()
        await expect(page.getByText('Local folder "sample1" set for this map')).toBeVisible()
        await localSource.openMapSelector()

        // Assert
        await expect(page.getByTestId("map-local-folder-name").first()).toContainText("sample1")
        await expect(page.getByTestId("map-local-folder-editor-path").first()).toContainText("not set")
        await expect(page.getByTestId("map-local-folder-name").nth(1)).toContainText("not set")
    })

    test("should set a map's VS Code folder from the map selector and open files with it, with no local folder set", async ({ page }) => {
        // Arrange
        const localSource = new LocalSourcePageObject(page)
        await localSource.standInForThePicker("blockedByPolicy")
        await goto(page)
        await localSource.switchOn()
        await localSource.openMapSelector()

        // Act
        await page.locator("cc-map-selector li").first().click({ button: "right" })
        await page.getByText("Set VS Code Folder…").click()
        await localSource.editorDialog().locator("input").fill("/home/dev/sample1")
        await localSource.editorDialog().getByRole("button", { name: "Save" }).click()
        await expect(page.getByTestId("map-local-folder-editor-path").first()).toContainText("/home/dev/sample1")
        await page.locator("cc-map-selector .dropdown > button").click()
        await (await openMenuOf(page, BIG_LEAF)).getByText("Open in VS Code").click()

        // Assert
        await expect.poll(() => localSource.openedLinks()).toEqual(["vscode://file/home/dev/sample1/bigLeaf.ts"])
        await expect(page.getByText(BLOCKED_MESSAGE)).toHaveCount(0)
    })

    test("should forget a map's local folder when the map is removed", async ({ page }) => {
        // Arrange
        const localSource = new LocalSourcePageObject(page)
        await localSource.standInForThePicker("sampleFolder")
        await goto(page)
        await localSource.switchOn()
        await (await openMenuOf(page, SAMPLE_ONE)).getByText("Set Local Folder…").click()
        await expect(page.getByText('Local folder "sample1" set for this map')).toBeVisible()
        await expect.poll(() => localSource.savedFolderKeys()).toEqual(["sample1.cc.json"])

        // Act
        await localSource.openMapSelector()
        await page.locator("cc-map-selector li").first().getByTitle("Remove map").click()
        await page.getByRole("button", { name: "Apply" }).click()

        // Assert
        await expect.poll(() => localSource.savedFolderKeys()).toEqual([])
    })

    test("should not show a file above 5 MB, but offer to open it in VS Code", async ({ page }) => {
        // Arrange
        const localSource = new LocalSourcePageObject(page)
        await localSource.standInForThePicker("sampleFolderWithLargeFiles")
        await goto(page)
        await localSource.switchOn()

        // Act
        await (await openMenuOf(page, BIG_LEAF)).getByText("Show Source").click()
        await localSource.selectFolderInTheDialog()

        // Assert
        await expect(page.getByTestId("local-source-not-shown")).toContainText("This file is 6 MB, too large to show here (at most 5 MB).")
        await expect(page.getByTestId("local-source-not-shown").getByRole("button", { name: "Open in VS Code" })).toBeVisible()
    })

    test("should show a file with minified lines without colours and say why", async ({ page }) => {
        // Arrange
        const localSource = new LocalSourcePageObject(page)
        await localSource.standInForThePicker("sampleFolderWithLargeFiles")
        await goto(page)
        await localSource.switchOn()

        // Act
        await (await openMenuOf(page, `${SAMPLE_ONE}/sample1OnlyLeaf.scss`)).getByText("Show Source").click()
        await localSource.selectFolderInTheDialog()

        // Assert
        await expect(page.getByTestId("local-source-uncoloured-note")).toHaveText(
            "Shown without colours: has lines longer than 20,000 characters"
        )
        await expect(localSource.sourceDialog().locator(".token")).toHaveCount(0)
    })

    test("should keep a long file's real size and scroll it with the arrow keys", async ({ page }) => {
        // Arrange
        const localSource = new LocalSourcePageObject(page)
        await localSource.standInForThePicker("sampleFolderWithLongFile")
        await goto(page)
        await localSource.switchOn()
        await (await openMenuOf(page, BIG_LEAF)).getByText("Show Source").click()
        await localSource.selectFolderInTheDialog()
        const code = localSource.sourceDialog().getByLabel("Source code")
        await expect(code).toContainText("export const line = 1")

        // Act
        await page.keyboard.press("ArrowDown")

        // Assert
        await expect.poll(() => code.evaluate(element => element.scrollTop)).toBeGreaterThan(0)
        const size = await code.evaluate(element => ({
            hasHorizontalScrollbar: element.scrollWidth > element.clientWidth,
            height: element.scrollHeight
        }))
        expect(size).toEqual({ hasHorizontalScrollbar: false, height: 600 * 24 })
    })

    test("should refuse a folder that holds none of the map's files", async ({ page }) => {
        // Arrange
        const localSource = new LocalSourcePageObject(page)
        await localSource.standInForThePicker("unrelatedFolder")
        await goto(page)
        await localSource.switchOn()

        // Act
        await (await openMenuOf(page, BIG_LEAF)).getByText("Show Source").click()
        await localSource.selectFolderInTheDialog()

        // Assert
        await expect(localSource.folderDialog().getByTestId("local-source-folder-problem")).toContainText("does not match this map")
        await expect(localSource.sourceDialog()).toBeHidden()
    })

    test("should hide the local source for the session once the browser blocks the folder picker", async ({ page }) => {
        // Arrange
        const localSource = new LocalSourcePageObject(page)
        await localSource.standInForThePicker("blockedByPolicy")
        await goto(page)
        await localSource.switchOn()

        // Act
        await (await openMenuOf(page, BIG_LEAF)).getByText("Show Source").click()
        await localSource.selectFolderInTheDialog()
        await expect(page.getByText(BLOCKED_MESSAGE)).toBeVisible()
        const menuAfterTheBlock = await openMenuOf(page, BIG_LEAF)

        // Assert
        await expect(menuAfterTheBlock.getByText("Show Source")).toHaveCount(0)
    })

    test("should explain the folder before opening the browser's picker, and open nothing when cancelled", async ({ page }) => {
        // Arrange
        const localSource = new LocalSourcePageObject(page)
        await localSource.standInForThePicker("sampleFolder")
        await goto(page)
        await localSource.switchOn()

        // Act
        await (await openMenuOf(page, BIG_LEAF)).getByText("Show Source").click()
        const folderDialog = localSource.folderDialog()
        await expect(folderDialog).toContainText("so its files can be viewed in the browser")
        await folderDialog.getByRole("button", { name: "Cancel" }).click()

        // Assert
        await expect(folderDialog).toHaveCount(0)
        expect(await localSource.savedFolderKeys()).toEqual([])
        await expect(localSource.sourceDialog()).toBeHidden()
    })

    test("should offer neither the switch nor the local source in a browser without a folder picker", async ({ page }) => {
        // Arrange
        const localSource = new LocalSourcePageObject(page)
        await localSource.standInForThePicker("missing")
        await goto(page)

        // Act
        await localSource.openSettings()
        const switchInTheSettings = page.getByLabel("Open local source files (experimental)")
        await page.keyboard.press("Escape")
        const menu = await openMenuOf(page, BIG_LEAF)

        // Assert
        await expect(switchInTheSettings).toHaveCount(0)
        await expect(menu.getByText("Show Source")).toHaveCount(0)
    })
})
