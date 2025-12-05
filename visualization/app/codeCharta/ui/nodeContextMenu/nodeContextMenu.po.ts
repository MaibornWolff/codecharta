import { Page } from "@playwright/test"
import { clickButtonOnPageElement } from "../../../playwright.helper"

export class NodeContextMenuPageObject {
    constructor(private page: Page) {}

    async hasColorButtons() {
        return this.page.locator(".colorButton").first().waitFor({ state: "visible" })
    }

    async exclude() {
        await clickButtonOnPageElement(this.page, "#exclude-button")
        await this.page.locator("#loading-gif-map").waitFor({ state: "hidden" })
    }

    async isOpened() {
        await this.page.locator("#codemap-context-menu").waitFor({ state: "visible" })
    }

    async isClosed() {
        await this.page.locator("#codemap-context-menu").waitFor({ state: "hidden" })
    }

    async clickOnExclude() {
        await clickButtonOnPageElement(this.page, "[id='exclude-button']", { button: "left" })
    }
}
