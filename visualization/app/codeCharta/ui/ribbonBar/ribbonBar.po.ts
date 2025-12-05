import { Page } from "@playwright/test"
import { clickButtonOnPageElement } from "../../../playwright.helper"

export class RibbonBarPageObject {
    constructor(private page: Page) {}

    async isPanelOpen(elementName: string) {
        await this.page.locator(elementName).waitFor({ state: "attached" })
        const classNames = await this.page.locator(elementName).getAttribute("class")
        return classNames?.includes("expanded") ?? false
    }

    async togglePanel(selector: string, elementName: string) {
        const wasOpen = await this.isPanelOpen(elementName)
        await clickButtonOnPageElement(this.page, `#${selector}-card .section .section-title`)

        if (wasOpen) {
            await this.page.locator(`#${selector}-card`).waitFor({ state: "visible" })
        } else {
            await this.page.locator(`#${selector}-card.expanded`).waitFor({ state: "visible" })
        }

        return !wasOpen
    }
}
