import { clickButtonOnPageElement } from "../../../../puppeteer.helper"

export class SearchPanelPageObject {
    private EXPANDED = "expanded"

    async toggle() {
        const wasOpen = await this.isOpen()
        await clickButtonOnPageElement("cc-search-panel .section .section-title")

        // Wait for panel to finish opening/closing by checking if content is visible
        if (!wasOpen) {
            await page.waitForSelector("cc-map-tree-view:not([hidden])", { visible: true, timeout: 5000 })
        }

        return !wasOpen
    }

    async isOpen() {
        await page.waitForSelector("cc-search-panel cc-ribbon-bar-panel")
        const classNames = await page.$eval("cc-search-panel cc-ribbon-bar-panel", element => element["className"])
        return classNames.includes(this.EXPANDED)
    }
}
