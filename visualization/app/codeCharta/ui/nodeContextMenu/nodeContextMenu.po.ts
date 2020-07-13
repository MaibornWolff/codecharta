import { Page } from "puppeteer"

export class NodeContextMenuPageObject {
	constructor(private page: Page) {}

	public async hasColorButtons() {
		return this.page.waitForSelector(".colorButton", {
			visible: true
		})
	}

	public async exclude() {
		return this.page.click("#exclude-button")
	}
}
