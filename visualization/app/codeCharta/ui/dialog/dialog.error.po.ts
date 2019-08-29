import { Page } from "puppeteer"

export class DialogErrorPageObject {
	constructor(private page: Page) {}

	public async getMessage() {
		return await this.page.$eval(".md-dialog-content-body p", el => el["innerText"])
	}

	public async clickOk() {
		return this.page.click("md-dialog-actions button")
	}
}
