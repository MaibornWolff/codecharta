import { expect, test } from "@playwright/test"
import { clearIndexedDB, goto, readPersistedLayoutAlgorithm, withDiskBackedPage } from "../../../../../playwright.helper"
import { ExplorerTreeLevelPageObject } from "../../../sidebarExplorer/components/explorerTreeLevel/explorerTreeLevel.po"
import { SidebarInspectorPageObject } from "../../../sidebarInspector/components/sidebarInspector/sidebarInspector.po"
import { SunburstMapPageObject } from "./sunburstMap.po"

const INNER_RING = 0.35
const CENTRE = 0
const JUST_PAST_THE_TOP = 15

test.describe("Sunburst layout", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should replace the 3D map and its 3D-only controls", async ({ page }) => {
        // Arrange
        const sunburst = new SunburstMapPageObject(page)

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
        const sunburst = new SunburstMapPageObject(page)
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
        const sunburst = new SunburstMapPageObject(page)
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

    test("should bring the 3D map back when another layout is chosen", async ({ page }) => {
        // Arrange
        const sunburst = new SunburstMapPageObject(page)
        await sunburst.switchLayoutTo("Sunburst")
        await expect(sunburst.chart()).toBeVisible()

        // Act
        await sunburst.switchLayoutTo("Squarified TreeMap")

        // Assert
        await expect(sunburst.chart()).toHaveCount(0)
        await expect(page.locator("#codeMap")).toBeVisible()
    })

    test("should come back as a sunburst after a reload and still hand the map back to 3D", async () => {
        // A second boot needs a disk-backed page and the headroom its extra browser launch brings.
        test.setTimeout(60_000)
        await withDiskBackedPage(async page => {
            // Arrange
            const errors: string[] = []
            page.on("pageerror", error => errors.push(error.message))
            page.on("console", message => message.type() === "error" && errors.push(message.text()))
            const sunburst = new SunburstMapPageObject(page)
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
