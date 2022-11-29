import { clickButtonOnPageElement } from "../../../../puppeteer.helper"

export class DialogErrorPageObject {
	async getMessage() {
		await page.waitForSelector(".mat-dialog-content")
		return page.$eval(".mat-dialog-content", element => element["innerText"])
	}

	async clickOk() {
		await clickButtonOnPageElement(".mat-dialog-actions button")
		await page.waitForSelector(".mat-dialog-actions button", { visible: false })
	}

	async clickOkAndReturnWhenFullyClosed() {
		await clickButtonOnPageElement(".mat-dialog-actions button")
		await page.waitForFunction(() => !document.querySelector(".mat-dialog-content"))
	}
}
