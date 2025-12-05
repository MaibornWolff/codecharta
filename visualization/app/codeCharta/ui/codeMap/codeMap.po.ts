import { Page } from "@playwright/test"
import { clickButtonOnPageElement } from "../../../playwright.helper"

export class CodeMapPageObject {
    constructor(private page: Page) {}

    async clickMap() {
        await clickButtonOnPageElement(this.page, "#codeMap", { button: "left" })
    }

    async rightClickMouseDownOnMap() {
        const codeMapElement = this.page.locator("#codeMap")
        await codeMapElement.hover()
        await this.page.mouse.down({ button: "right" })
    }

    async mouseWheelWithinMap() {
        const codeMapElement = this.page.locator("#codeMap")
        await codeMapElement.hover()
        await this.page.mouse.wheel(100, 0)
    }
}
