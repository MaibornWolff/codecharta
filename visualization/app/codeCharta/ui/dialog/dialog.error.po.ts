import { Page } from "puppeteer"
import { click, waitForElementRemoval } from "../../../puppeteer.helper"

export class DialogErrorPageObject {
	constructor(private page: Page) {}

	public async getMessage() {
		return await this.page.$eval(".md-dialog-content-body", el => el["innerText"])
	}

	public async clickOk() {
		await click("md-dialog-actions button")
		await waitForElementRemoval("md-dialog-actions button")
	}
}
