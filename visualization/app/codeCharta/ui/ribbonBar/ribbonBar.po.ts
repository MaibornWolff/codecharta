import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class RibbonBarPageObject {
    async isPanelOpen(elementName: string) {
        await page.waitForFunction(elementName => document.querySelector(elementName), {}, elementName)
        return page.$eval(elementName, element => !element.classList.contains("hidden"))
    }

    async togglePanel(selector: string, elementName: string) {
        const wasOpen = await this.isPanelOpen(elementName)
        await clickButtonOnPageElement(`#${selector}-card .section .section-title`)

        await (wasOpen ? page.waitForSelector(`#${selector}-card`) : page.waitForSelector(`#${selector}-card.expanded`))

        return !wasOpen
    }
}
