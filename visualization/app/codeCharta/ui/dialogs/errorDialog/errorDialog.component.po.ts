import { Page } from "@playwright/test"
import { clickButtonOnPageElement } from "../../../../playwright.helper"

export class DialogErrorPageObject {
    constructor(private page: Page) {}

    async getMessage() {
        return this.page.locator(".mat-mdc-dialog-content").innerText()
    }

    async clickOk() {
        await clickButtonOnPageElement(this.page, ".mat-mdc-dialog-actions button")
        // Wait for the dialog container to be fully removed from DOM (not just hidden)
        await this.page.locator("mat-dialog-container").waitFor({ state: "detached", timeout: 10_000 })
    }
}
