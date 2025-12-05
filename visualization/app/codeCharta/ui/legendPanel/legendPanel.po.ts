import { Page } from "@playwright/test"
import { clickButtonOnPageElement } from "../../../playwright.helper"

export class LegendPanelObject {
    constructor(private page: Page) {}

    async open() {
        await clickButtonOnPageElement(this.page, "cc-legend-panel .panel-button")
        await this.page.locator("cc-legend-panel .block-wrapper").waitFor({ state: "visible" })
    }

    async getMultipleFilenames() {
        const items = this.page.locator("cc-legend-panel cc-legend-marked-packages cc-labelled-color-picker")
        const count = await items.count()
        const filenames: string[] = []
        for (let i = 0; i < count; i++) {
            const text = await items.nth(i).innerText()
            filenames.push(text.trim())
        }
        return filenames
    }

    async getFilename() {
        const text = await this.page.locator("cc-legend-panel cc-legend-marked-packages cc-labelled-color-picker").innerText()
        return text.trim()
    }

    async getEmptyLegendIfNoFilenamesExist() {
        return this.page.locator("cc-legend-panel cc-legend-marked-packages").innerText()
    }
}
