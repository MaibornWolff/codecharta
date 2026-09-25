import { expect, test } from "@playwright/test"
import {
    clearIndexedDB,
    goto,
    readPersistedLayoutAlgorithm,
    readPersistedPreference,
    withDiskBackedPage
} from "../../../../../playwright.helper"
import { MetricsBarPageObject } from "../../../metricsBar/components/metricsBar/metricsBar.po"
import { ExplorerTreeLevelPageObject } from "../../../sidebarExplorer/components/explorerTreeLevel/explorerTreeLevel.po"
import { SidebarInspectorPageObject } from "../../../sidebarInspector/components/sidebarInspector/sidebarInspector.po"
import { RadialMapPageObject } from "./radialMap.po"

const INNER_RING = 0.35
const CENTRE = 0
const JUST_PAST_THE_TOP = 15
const KEPT_FOLDER = 200
const FILE_BESIDE_IT = 330
const HALF = 0.5
const NEUTRAL_FOLDER_GREY = "#d9dce1"
const MANY_PIXELS = 1000
const SELECTION_ORANGE = "#eb8319"
const FIRST_MARK_PINK = "#ff1d8e"

test.describe("Sunburst layout", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should replace the 3D map and its 3D-only controls", async ({ page }) => {
        // Arrange
        const sunburst = new RadialMapPageObject(page)

        // Act
        await sunburst.switchLayoutTo("Sunburst")

        // Assert
        await expect(sunburst.chart()).toBeVisible()
        await expect(page.locator("#codeMap")).toBeHidden()
        await expect(page.locator("cc-view-cube")).toBeHidden()
        await expect(page.getByRole("button", { name: "3D Print" })).toHaveCount(0)
        await expect(page.getByTestId("metric-segment-height")).toHaveCount(0)
    })

    test("should drill into a clicked folder and back up through the centre, showing each in the inspector", async ({ page }) => {
        // Arrange
        const sunburst = new RadialMapPageObject(page)
        const inspector = new SidebarInspectorPageObject(page)
        await sunburst.switchLayoutTo("Sunburst")

        // Act
        await sunburst.clickAt(INNER_RING)

        // Assert
        await inspector.waitUntilOpen()
        await expect(inspector.nodeName()).toHaveText("sample2.cc.json")

        // Act
        await sunburst.clickAt(CENTRE)

        // Assert
        await expect(inspector.nodeName()).toHaveText("root")
    })

    test("should select a clicked file without stepping into anything", async ({ page }) => {
        // Arrange
        const sunburst = new RadialMapPageObject(page)
        const explorer = new ExplorerTreeLevelPageObject(page)
        const inspector = new SidebarInspectorPageObject(page)
        await sunburst.switchLayoutTo("Sunburst")
        await explorer.selectNode("/root/sample1.cc.json")
        await inspector.waitUntilOpen()

        // Act
        await sunburst.clickAt(INNER_RING, JUST_PAST_THE_TOP)

        // Assert
        await expect(inspector.nodeName()).toHaveText("sample1OnlyLeaf.scss")

        // Act
        await sunburst.clickAt(INNER_RING, JUST_PAST_THE_TOP)

        // Assert
        await expect(inspector.nodeName()).toHaveText("sample1OnlyLeaf.scss")
    })

    test("should offer the node menu on a right-clicked segment", async ({ page }) => {
        // Arrange
        const sunburst = new RadialMapPageObject(page)
        await sunburst.switchLayoutTo("Sunburst")

        // Act
        await sunburst.rightClickAt(INNER_RING)

        // Assert
        const menu = page.locator("#codemap-context-menu")
        await expect(menu).toBeVisible()
        await expect(menu).toContainText("Exclude")
        await expect(menu).toContainText("Focus")
        await expect(menu).toContainText("Keep Highlight")
    })

    test("should fade everything but a kept highlight until it is removed, even while the hover fades out", async ({ page }) => {
        // Arrange
        const sunburst = new RadialMapPageObject(page)
        const menu = page.locator("#codemap-context-menu")
        await sunburst.switchLayoutTo("Sunburst")
        await sunburst.clickAt(INNER_RING, JUST_PAST_THE_TOP)
        await sunburst.movePointerAway()
        await sunburst.waitUntilDrawn()
        await sunburst.rightClickAt(INNER_RING, KEPT_FOLDER)

        // Act
        await menu.getByText("Keep Highlight").click()
        await sunburst.movePointerAway()

        // Assert
        await expect.poll(() => sunburst.opacityAt(INNER_RING, FILE_BESIDE_IT)).toBeLessThan(HALF)
        await expect.poll(() => sunburst.opacityAt(INNER_RING, KEPT_FOLDER)).toBe(1)

        // Act
        await sunburst.rightClickAt(INNER_RING, KEPT_FOLDER)
        await menu.getByText("Remove Highlight").click()
        await sunburst.movePointerAway()

        // Assert
        await expect.poll(() => sunburst.opacityAt(INNER_RING, FILE_BESIDE_IT)).toBe(1)
    })

    test("should paint the selected file in the selection colour, but not the folder it steps into", async ({ page }) => {
        // Arrange
        const sunburst = new RadialMapPageObject(page)
        const explorer = new ExplorerTreeLevelPageObject(page)
        await sunburst.switchLayoutTo("Sunburst")
        await explorer.selectNode("/root/sample1.cc.json")
        await sunburst.waitUntilCentredOn("/root/sample1.cc.json")
        await sunburst.movePointerAway()
        await expect.poll(() => sunburst.countPixelsOfColor(SELECTION_ORANGE)).toBe(0)

        // Act
        await sunburst.clickAt(INNER_RING, JUST_PAST_THE_TOP)
        await sunburst.movePointerAway()

        // Assert
        await expect.poll(() => sunburst.countPixelsOfColor(SELECTION_ORANGE)).toBeGreaterThan(MANY_PIXELS)
    })

    test("should light the files of a hovered file type and fade the rest", async ({ page }) => {
        // Arrange
        const sunburst = new RadialMapPageObject(page)
        await sunburst.switchLayoutTo("Sunburst")
        await sunburst.waitUntilDrawn()
        const unhighlighted = await sunburst.pixelFingerprint()
        const fileTypeSegment = page.locator("cc-file-extension-bar-segment", { hasText: "scss" }).locator("[data-test-id=formattedTitle]")

        // Act
        await fileTypeSegment.hover()

        // Assert
        await expect.poll(() => sunburst.pixelFingerprint()).not.toBe(unhighlighted)

        // Act
        await sunburst.movePointerAway()

        // Assert
        await expect.poll(() => sunburst.pixelFingerprint()).toBe(unhighlighted)
    })

    test("should colour a folder marked from the node menu in its mark colour", async ({ page }) => {
        // Arrange
        const sunburst = new RadialMapPageObject(page)
        await sunburst.switchLayoutTo("Sunburst")
        await sunburst.waitUntilDrawn()
        await expect.poll(() => sunburst.countPixelsOfColor(FIRST_MARK_PINK)).toBe(0)
        await sunburst.rightClickAt(INNER_RING)

        // Act
        await page.locator("#codemap-context-menu").getByTitle("Colorize folder").first().click()
        await sunburst.movePointerAway()

        // Assert
        await expect.poll(() => sunburst.countPixelsOfColor(FIRST_MARK_PINK)).toBeGreaterThan(MANY_PIXELS)
    })

    test("should bring the 3D map back when another layout is chosen", async ({ page }) => {
        // Arrange
        const sunburst = new RadialMapPageObject(page)
        await sunburst.switchLayoutTo("Sunburst")
        await expect(sunburst.chart()).toBeVisible()

        // Act
        await sunburst.switchLayoutTo("Squarified TreeMap")

        // Assert
        await expect(sunburst.chart()).toHaveCount(0)
        await expect(page.locator("#codeMap")).toBeVisible()
    })

    test("should recolour the folders from the Folders card", async ({ page }) => {
        // Arrange
        const sunburst = new RadialMapPageObject(page)
        const metricsBar = new MetricsBarPageObject(page)
        await sunburst.switchLayoutTo("Sunburst")
        await expect(metricsBar.foldersCard()).toContainText("max")
        await expect.poll(() => sunburst.countPixelsOfColor(NEUTRAL_FOLDER_GREY)).toBe(0)
        const tintedByMax = await sunburst.pixelFingerprint()

        // Act
        await metricsBar.pickFolderValue("min")

        // Assert
        await expect(metricsBar.foldersCard()).toContainText("min")
        await expect.poll(() => sunburst.pixelFingerprint()).not.toBe(tintedByMax)

        // Act
        await metricsBar.setFolderStyle("neutral")

        // Assert
        await expect(metricsBar.foldersCard()).toContainText("neutral")
        await expect.poll(() => sunburst.countPixelsOfColor(NEUTRAL_FOLDER_GREY)).toBeGreaterThan(MANY_PIXELS)
    })

    test("should keep the folder colours after a reload", async () => {
        test.setTimeout(60_000)
        await withDiskBackedPage(async page => {
            // Arrange
            const sunburst = new RadialMapPageObject(page)
            const metricsBar = new MetricsBarPageObject(page)
            await goto(page)
            await sunburst.switchLayoutTo("Sunburst")
            await metricsBar.pickFolderValue("median")
            await metricsBar.setFolderStyle("neutral")
            await expect.poll(() => readPersistedPreference(page, "radialFolderStyle"), { timeout: 30_000 }).toBe("neutral")

            // Act
            await goto(page)

            // Assert
            await expect(metricsBar.foldersCard()).toContainText("median")
            await expect(metricsBar.foldersCard()).toContainText("neutral")
            await expect.poll(() => sunburst.countPixelsOfColor(NEUTRAL_FOLDER_GREY)).toBeGreaterThan(MANY_PIXELS)
        })
    })

    test("should come back as a sunburst after a reload and still hand the map back to 3D", async () => {
        // A second boot needs a disk-backed page and the headroom its extra browser launch brings.
        test.setTimeout(60_000)
        await withDiskBackedPage(async page => {
            // Arrange
            const errors: string[] = []
            page.on("pageerror", error => errors.push(error.message))
            page.on("console", message => message.type() === "error" && errors.push(message.text()))
            const sunburst = new RadialMapPageObject(page)
            const explorer = new ExplorerTreeLevelPageObject(page)
            const inspector = new SidebarInspectorPageObject(page)
            await goto(page)
            await sunburst.switchLayoutTo("Sunburst")
            await expect.poll(() => readPersistedLayoutAlgorithm(page), { timeout: 30_000 }).toBe("Sunburst")

            // Act
            await goto(page)
            await explorer.openFolder("/root/sample1.cc.json")
            await explorer.hoverNode("/root/sample1.cc.json/ParentLeaf")
            await explorer.selectNode("/root/sample1.cc.json/ParentLeaf")

            // Assert
            await expect(sunburst.chart()).toBeVisible()
            await inspector.waitUntilOpen()
            await expect(inspector.nodeName()).toHaveText("ParentLeaf")

            // Act
            await sunburst.switchLayoutTo("Squarified TreeMap")

            // Assert
            await expect(page.locator("#codeMap").getByText("bigLeaf.ts").first()).toBeVisible()
            expect(errors).toEqual([])
        })
    })
})

const HEADER_STRIP = 0.22
const FIRST_BAND_CELLS = 0.45
const FILE_CELL_IN_FIRST_BAND = 195

test.describe("Radial treemap layout", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should replace the 3D map, and hand the chart over to the sunburst without errors", async ({ page }) => {
        // Arrange
        const errors: string[] = []
        page.on("pageerror", error => errors.push(error.message))
        page.on("console", message => message.type() === "error" && errors.push(message.text()))
        const radialTreemap = new RadialMapPageObject(page)

        // Act
        await radialTreemap.switchLayoutTo("Radial TreeMap")

        // Assert
        await expect(radialTreemap.chart()).toBeVisible()
        await expect(radialTreemap.chart()).toHaveAttribute("aria-busy", "false")
        await expect(page.locator("#codeMap")).toBeHidden()

        // Act
        await radialTreemap.switchLayoutTo("Sunburst")

        // Assert
        await expect(radialTreemap.chart()).toHaveAttribute("aria-busy", "false")
        expect(errors).toEqual([])
    })

    test("should drill into a folder from its header strip or its cell, and back up through the centre", async ({ page }) => {
        // Arrange
        const radialTreemap = new RadialMapPageObject(page)
        const inspector = new SidebarInspectorPageObject(page)
        await radialTreemap.switchLayoutTo("Radial TreeMap")

        // Act
        await radialTreemap.clickAt(HEADER_STRIP)

        // Assert
        await inspector.waitUntilOpen()
        await expect(inspector.nodeName()).toHaveText("sample2.cc.json")

        // Act
        await radialTreemap.waitUntilCentredOn("/root/sample2.cc.json")
        await radialTreemap.clickAt(CENTRE)
        await radialTreemap.waitUntilCentredOn("/root")
        await radialTreemap.clickAt(FIRST_BAND_CELLS)

        // Assert
        await expect(inspector.nodeName()).toHaveText("ParentLeaf")

        // Act
        await radialTreemap.waitUntilCentredOn("/root/sample2.cc.json/ParentLeaf")
        await radialTreemap.clickAt(CENTRE)

        // Assert
        await expect(inspector.nodeName()).toHaveText("sample2.cc.json")

        // Act
        await radialTreemap.waitUntilCentredOn("/root/sample2.cc.json")
        await radialTreemap.clickAt(CENTRE)
        await radialTreemap.waitUntilCentredOn("/root")
        await radialTreemap.clickAt(HEADER_STRIP)

        // Assert
        await radialTreemap.waitUntilCentredOn("/root/sample2.cc.json")
    })

    test("should select a file from its cell without stepping into anything", async ({ page }) => {
        // Arrange
        const radialTreemap = new RadialMapPageObject(page)
        const inspector = new SidebarInspectorPageObject(page)
        await radialTreemap.switchLayoutTo("Radial TreeMap")

        // Act
        await radialTreemap.clickAt(FIRST_BAND_CELLS, FILE_CELL_IN_FIRST_BAND)

        // Assert
        await inspector.waitUntilOpen()
        await expect(inspector.nodeName()).toHaveText("bigLeaf.ts")

        // Act
        await radialTreemap.clickAt(FIRST_BAND_CELLS, FILE_CELL_IN_FIRST_BAND)

        // Assert
        await expect(inspector.nodeName()).toHaveText("bigLeaf.ts")
    })
})
