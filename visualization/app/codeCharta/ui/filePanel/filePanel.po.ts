import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class FilePanelPageObject {
    async getSelectedName() {
        await page.waitForSelector("cc-file-panel cc-file-panel-file-selector .mat-mdc-select-value-text span")
        return page.$eval("cc-file-panel cc-file-panel-file-selector .mat-mdc-select-value-text span", element => element["innerText"])
    }

    async getAllNames() {
        await clickButtonOnPageElement("cc-file-panel cc-file-panel-file-selector mat-select")
        await page.waitForSelector(".mat-mdc-select-panel")
        const content = await page.$$eval(".mat-mdc-select-panel .mdc-list-item__primary-text", element =>
            element.map(item => item["innerText"].trim())
        )
        return content
    }
}
