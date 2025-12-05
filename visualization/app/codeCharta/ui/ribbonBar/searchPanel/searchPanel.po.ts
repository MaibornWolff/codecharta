import { Page } from "@playwright/test"
import { clickButtonOnPageElement } from "../../../../playwright.helper"

export class SearchPanelPageObject {
    private EXPANDED = "expanded"

    constructor(private page: Page) {}

    async toggle() {
        const wasOpen = await this.isOpen()
        await clickButtonOnPageElement(this.page, "cc-search-panel .section .section-title")

        if (!wasOpen) {
            await this.page.locator("cc-map-tree-view:not([hidden])").waitFor({ state: "visible", timeout: 5000 })
        }

        return !wasOpen
    }

    async isOpen() {
        await this.page.locator("cc-search-panel cc-ribbon-bar-panel").waitFor({ state: "attached" })
        const classNames = await this.page.locator("cc-search-panel cc-ribbon-bar-panel").getAttribute("class")
        return classNames?.includes(this.EXPANDED) ?? false
    }
}
