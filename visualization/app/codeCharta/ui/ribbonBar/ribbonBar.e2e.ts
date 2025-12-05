import { test, expect } from "@playwright/test"
import { CC_URL, clearIndexedDB, goto } from "../../../playwright.helper"
import { RibbonBarPageObject } from "./ribbonBar.po"
import { SearchPanelPageObject } from "./searchPanel/searchPanel.po"

test.describe("RibbonBar", () => {
    const sampleMap = `sample3.cc.json`

    test.beforeEach(async ({ page }) => {
        await goto(page)
    })

    test.afterEach(async ({ page }) => {
        await clearIndexedDB(page)
    })

    test("should open a section, open the search bar and close the section again automatically", async ({ page }) => {
        const searchPanel = new SearchPanelPageObject(page)
        const ribbonBar = new RibbonBarPageObject(page)

        const areaPanel = "area-metric"
        const edgePanel = "edge-metric"

        let isAreaSettingsPanelOpen = await ribbonBar.togglePanel(areaPanel, "#area-metric-card")
        expect(isAreaSettingsPanelOpen).toBeTruthy()

        const isSearchPanelOpen = await searchPanel.toggle()
        expect(isSearchPanelOpen).toBeTruthy()
        expect(await ribbonBar.isPanelOpen("#area-metric-card")).toBeFalsy()

        isAreaSettingsPanelOpen = await ribbonBar.togglePanel(areaPanel, "#area-metric-card")
        expect(isAreaSettingsPanelOpen).toBeTruthy()
        expect(await searchPanel.isOpen()).toBeFalsy()

        const isEdgeSettingsPanelOpen = await ribbonBar.togglePanel(edgePanel, "#edge-metric-card")
        expect(isEdgeSettingsPanelOpen).toBeTruthy()
        expect(await ribbonBar.isPanelOpen("#area-metric-card")).toBeFalsy()
    })

    test("should open suspicious metrics and high risk profile menu", async ({ page }) => {
        await page.goto(`${CC_URL}?file=codeCharta/assets/${sampleMap}`)
        await page.click("cc-suspicious-metrics")
        const suspiciousMetricsMenu = page.locator(".mat-mdc-menu-panel.cc-ai-drop-down.cc-suspicious-metric-panel")
        await suspiciousMetricsMenu.waitFor({ state: "visible" })
        expect(await suspiciousMetricsMenu.isVisible()).toBeTruthy()
        const titleElement = suspiciousMetricsMenu.locator(".sub-title").first()
        const titleContent = await titleElement.textContent()
        expect(titleContent?.trim()).toBe("Suspicious Metrics in .ts code")
    })
})
