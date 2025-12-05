import { Page } from "@playwright/test"
import { clickButtonOnPageElement } from "../../../../playwright.helper"

export class UploadFileButtonPageObject {
    constructor(private page: Page) {}

    async openFiles(paths: string[], clickOnFileChooser = true) {
        const fileChooserPromise = this.page.waitForEvent("filechooser", { timeout: 60_000 })

        if (clickOnFileChooser) {
            await clickButtonOnPageElement(this.page, "[title='Load cc.json files']")
        }

        const fileChooser = await fileChooserPromise
        await fileChooser.setFiles(paths)

        // Wait for loading to complete - the gif might already be hidden if loading is fast
        await this.page.locator("#loading-gif-file").waitFor({ state: "hidden", timeout: 60_000 })
    }

    async cancelOpeningFile() {
        const fileChooserPromise = this.page.waitForEvent("filechooser")
        await clickButtonOnPageElement(this.page, "[title='Load cc.json files']")
        // Wait for file chooser to be triggered, but don't set any files (equivalent to cancel)
        await fileChooserPromise
        // Give the UI time to stabilize after dialog closes without selection
        await this.page.waitForTimeout(100)
    }
}
