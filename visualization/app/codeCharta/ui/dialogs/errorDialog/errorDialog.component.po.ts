import { clickButtonOnPageElement } from "../../../../puppeteer.helper"

export class DialogErrorPageObject {
    async getMessage() {
        await page.waitForSelector(".mat-mdc-dialog-content")
        return page.$eval(".mat-mdc-dialog-content", element => element["innerText"])
    }

    async clickOk() {
        await clickButtonOnPageElement(".mat-mdc-dialog-actions button")
        await page.waitForFunction(() => !document.querySelector(".mat-mdc-dialog-actions button"))
    }
}
