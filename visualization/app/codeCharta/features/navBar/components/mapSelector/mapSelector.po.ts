import { Page } from "@playwright/test"

export class MapSelectorPageObject {
    constructor(private page: Page) {}

    async getSelectedName() {
        return this.page.locator("cc-map-selector .dropdown > button .truncate").innerText()
    }

    async getAllNames() {
        const trigger = this.page.locator("cc-map-selector .dropdown > button")
        await trigger.click()
        const items = this.page.locator("cc-map-selector .dropdown-content ul li label > span > span")
        await items.first().waitFor({ state: "visible" })
        const count = await items.count()
        const names: string[] = []
        for (let i = 0; i < count; i++) {
            const text = await items.nth(i).innerText()
            names.push(text.trim())
        }
        await trigger.click()
        return names
    }
}
