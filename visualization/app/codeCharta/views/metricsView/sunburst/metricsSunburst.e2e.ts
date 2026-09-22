import { expect, test } from "@playwright/test"
import { clearIndexedDB, goto } from "../../../../playwright.helper"
import { SidebarInspectorPageObject } from "../../../features/sidebarInspector/components/sidebarInspector/sidebarInspector.po"
import { MetricsSunburstPageObject } from "./metricsSunburst.po"

const INNER_RING = 0.35
const CENTRE = 0

test.describe("Sunburst layout", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should replace the 3D map and its 3D-only controls", async ({ page }) => {
        // Arrange
        const sunburst = new MetricsSunburstPageObject(page)

        // Act
        await sunburst.switchLayoutTo("Sunburst")

        // Assert
        await expect(sunburst.chart()).toBeVisible()
        await expect(page.locator("#codeMap")).toBeHidden()
        await expect(page.getByRole("button", { name: "3D Print" })).toHaveCount(0)
        await expect(page.getByTestId("metric-segment-height")).toHaveCount(0)
    })

    test("should drill into a clicked folder and back up through the centre, showing each in the inspector", async ({ page }) => {
        // Arrange
        const sunburst = new MetricsSunburstPageObject(page)
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

    test("should bring the 3D map back when another layout is chosen", async ({ page }) => {
        // Arrange
        const sunburst = new MetricsSunburstPageObject(page)
        await sunburst.switchLayoutTo("Sunburst")
        await expect(sunburst.chart()).toBeVisible()

        // Act
        await sunburst.switchLayoutTo("Squarified TreeMap")

        // Assert
        await expect(sunburst.chart()).toHaveCount(0)
        await expect(page.locator("#codeMap")).toBeVisible()
    })
})
