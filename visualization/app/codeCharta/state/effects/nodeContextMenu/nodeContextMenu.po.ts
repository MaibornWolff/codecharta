import { clickButtonOnPageElement } from "../../../../puppeteer.helper"

export class NodeContextMenuPageObject {
    async hasColorButtons() {
        return page.waitForSelector(".colorButton", {
            visible: true
        })
    }

    async exclude() {
        await clickButtonOnPageElement("#exclude-button")
        await page.waitForSelector("#loading-gif-map", { visible: false })
    }

    async isOpened() {
        await page.waitForSelector("#codemap-context-menu", { visible: true })
    }

    async isClosed() {
        await page.waitForSelector("#codemap-context-menu", { hidden: true })
    }

    async clickOnExclude() {
        await clickButtonOnPageElement(`[id='exclude-button']`, { button: "left" })
    }
}
