import { Page } from "@playwright/test"
import { clickButtonOnPageElement } from "../../../../../playwright.helper"

export class NavBarFolderButtonPageObject {
    constructor(private page: Page) {}

    async openFiles(paths: string[], clickOnFileChooser = true) {
        const fileChooserPromise = this.page.waitForEvent("filechooser")

        if (clickOnFileChooser) {
            await clickButtonOnPageElement(this.page, "[title='Load cc.json files']")
        }

        const fileChooser = await fileChooserPromise
        await fileChooser.setFiles(paths)

        await this.page.locator("#loading-gif-file").waitFor({ state: "hidden" })
    }

    async cancelOpeningFile() {
        const fileChooserPromise = this.page.waitForEvent("filechooser")
        await clickButtonOnPageElement(this.page, "[title='Load cc.json files']")
        await fileChooserPromise
        await this.page.waitForTimeout(100)
    }
}
