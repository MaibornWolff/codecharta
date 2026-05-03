import { Page } from "@playwright/test"
import { clickButtonOnPageElement } from "../../../../playwright.helper"

export class DialogErrorPageObject {
    constructor(private page: Page) {}

    async getMessage() {
        return this.page.locator("cc-error-dialog .dialog-content").innerText()
    }

    async clickOk() {
        await clickButtonOnPageElement(this.page, "cc-error-dialog .modal-action .btn")
        // Wait for the dialog to close (no longer "open" attribute)
        await this.page.waitForFunction(() => !document.querySelector("cc-error-dialog dialog[open]"), null, { timeout: 10_000 })
    }
}
