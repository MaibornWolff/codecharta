import { clickButtonOnPageElement } from "../../../../puppeteer.helper"

export class SearchPanelPageObject {
    private EXPANDED = "expanded"

    async toggle() {
        const wasOpen = await this.isOpen()
        await clickButtonOnPageElement("cc-search-panel .section .section-title")
        return !wasOpen
    }

    async isOpen() {
        await page.waitForSelector("cc-search-panel cc-ribbon-bar-panel")
        const classNames = await page.$eval("cc-search-panel cc-ribbon-bar-panel", element => element["className"])
        return classNames.includes(this.EXPANDED)
    }
}
