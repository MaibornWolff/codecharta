import { Page } from "@playwright/test"
import { clickButtonOnPageElement } from "../../../playwright.helper"

export class FilePanelPageObject {
    constructor(private page: Page) {}

    async getSelectedName() {
        return this.page.locator("cc-file-panel cc-file-panel-file-selector .mat-mdc-select-value-text span").innerText()
    }

    async getAllNames() {
        await clickButtonOnPageElement(this.page, "cc-file-panel cc-file-panel-file-selector mat-select")
        await this.page.locator(".mat-mdc-select-panel").waitFor({ state: "visible" })
        const items = this.page.locator(".mat-mdc-select-panel .mdc-list-item__primary-text")
        const count = await items.count()
        const names: string[] = []
        for (let i = 0; i < count; i++) {
            const text = await items.nth(i).innerText()
            names.push(text.trim())
        }
        return names
    }
}
