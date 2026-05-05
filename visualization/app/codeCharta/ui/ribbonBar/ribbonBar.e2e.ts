import { test, expect } from "@playwright/test"
import { clearIndexedDB, goto } from "../../../playwright.helper"
import { RibbonBarPageObject } from "./ribbonBar.po"

test.describe("RibbonBar", () => {
    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should open a panel and switch to a different panel", async ({ page }) => {
        const ribbonBar = new RibbonBarPageObject(page)

        const areaPanel = "area-metric"
        const edgePanel = "edge-metric"

        const isAreaSettingsPanelOpen = await ribbonBar.togglePanel(areaPanel, "#area-metric-card")
        expect(isAreaSettingsPanelOpen).toBeTruthy()

        const isEdgeSettingsPanelOpen = await ribbonBar.togglePanel(edgePanel, "#edge-metric-card")
        expect(isEdgeSettingsPanelOpen).toBeTruthy()
        expect(await ribbonBar.isPanelOpen("#area-metric-card")).toBeFalsy()
    })
})
