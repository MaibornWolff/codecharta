import { CC_URL, clearIndexedDB, goto } from "../../../puppeteer.helper"
import { RibbonBarPageObject } from "./ribbonBar.po"
import { SearchPanelPageObject } from "./searchPanel/searchPanel.po"

describe("RibbonBar", () => {
    const sampleMap = `sample3.cc.json`
    let searchPanel: SearchPanelPageObject
    let ribbonBar: RibbonBarPageObject

    beforeEach(async () => {
        searchPanel = new SearchPanelPageObject()
        ribbonBar = new RibbonBarPageObject()

        await goto()
    })

    afterEach(async () => {
        await clearIndexedDB()
    })

    it("should open a section, open the search bar and close the section again automatically", async () => {
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

    it("should open suspicious metrics and high risk profile menu ", async () => {
        await page.goto(`${CC_URL}?file=codeCharta/assets/${sampleMap}`)
        await page.click("cc-suspicious-metrics")
        const suspiciousMetricsMenu = await page.waitForSelector(".mat-mdc-menu-panel.mat-mdc-menu-panel.ai-drop-down")
        expect(suspiciousMetricsMenu).toBeTruthy()
        let titleElement = await suspiciousMetricsMenu.waitForSelector(".sub-title")
        let titleContent = await titleElement.evaluate(element => element.textContent)
        expect(titleContent.trim()).toBe("Suspicious Metrics in .ts code")

        await page.click("cc-code-charta #codeMap")
        await page.click("cc-high-risk-profile")
        const highRisProfileMenu = await page.waitForSelector(".mat-mdc-menu-panel.mat-mdc-menu-panel.ai-drop-down")
        expect(highRisProfileMenu).toBeTruthy()
        titleElement = await highRisProfileMenu.waitForSelector(".title")
        titleContent = await titleElement.evaluate(element => element.textContent)
        expect(titleContent).toBe("Risk Profile")
    })
})
