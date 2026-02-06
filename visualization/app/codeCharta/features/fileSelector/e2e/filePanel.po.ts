import { Page } from "@playwright/test"

export class FilePanelPageObject {
    constructor(private page: Page) {}

    async getSelectedName() {
        return this.page.locator("cc-file-panel cc-file-selector-dropdown details summary span.truncate").innerText()
    }

    async getAllNames() {
        const dropdown = this.page.locator("cc-file-panel cc-file-selector-dropdown details")
        await dropdown.click()
        await this.page.locator("cc-file-selector-dropdown .dropdown-content").waitFor({ state: "visible" })
        const items = this.page.locator("cc-file-selector-dropdown .dropdown-content ul li label span.truncate")
        const count = await items.count()
        const names: string[] = []
        for (let i = 0; i < count; i++) {
            const text = await items.nth(i).innerText()
            names.push(text.trim())
        }
        // Close the dropdown
        await dropdown.click()
        return names
    }
}
