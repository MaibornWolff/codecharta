import { Page } from "puppeteer"

export class DialogErrorPageObject {
	constructor(private page: Page) {}

	public async getMessage() {
		await this.page.waitForSelector("iframe")
		const iframeElement = await this.page.$("iframe")
		const frame = await iframeElement.contentFrame()
		await frame.waitForSelector(".md-dialog-content-body p")
		return await frame.$eval(".md-dialog-content-body p", el => el["innerText"])
	}

	public async clickOk() {
		return this.page.click("md-dialog-actions button")
	}
}
