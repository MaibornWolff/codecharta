import { expect, test } from "@playwright/test"
import { clearIndexedDB, collapseExplorer, goto } from "../../../../../playwright.helper"
import { NavBarFolderButtonPageObject } from "../../../navBar/components/navBarFolderButton/navBarFolderButton.po"
import { MetricsBarPageObject } from "./metricsBar.po"

test.describe("MetricsBar", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
        const uploadFilesButton = new NavBarFolderButtonPageObject(page)
        await uploadFilesButton.openFiles(["./app/codeCharta/resources/sample1_with_different_edges.cc.json"])
        // The metrics bar is centered on the viewport and intentionally sits behind the open explorer,
        // so collapse the explorer to expose its left-most (area) segment for interaction.
        await collapseExplorer(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should open the area metric select dropdown and list the available metrics", async ({ page }) => {
        const metricsBar = new MetricsBarPageObject(page)

        await metricsBar.openAreaMetricSelect()

        const options = await metricsBar.getAreaMetricOptionNames()
        expect(options.length).toBeGreaterThan(1)
        expect(options).toContain("rloc")
    })

    test("should filter the metric options when typing in the search box", async ({ page }) => {
        const metricsBar = new MetricsBarPageObject(page)

        await metricsBar.openAreaMetricSelect()
        await metricsBar.searchAreaMetric("functions")

        // Filtering re-renders the option list asynchronously, so poll instead of reading once
        await expect
            .poll(async () => {
                const options = await metricsBar.getAreaMetricOptionNames()
                return options.length > 0 && options.every(option => option.toLowerCase().includes("functions"))
            })
            .toBe(true)
    })

    test("should update the area segment when selecting a different metric", async ({ page }) => {
        const metricsBar = new MetricsBarPageObject(page)

        await metricsBar.openAreaMetricSelect()
        const currentMetric = await metricsBar.getSelectedAreaMetricName()

        const options = await metricsBar.getAreaMetricOptionNames()
        const otherMetric = options.find(option => option !== currentMetric)
        expect(otherMetric).toBeDefined()

        await metricsBar.selectAreaMetricOption(otherMetric as string)

        await expect(metricsBar.selectedAreaMetricName()).toHaveText(otherMetric as string)
    })
})
