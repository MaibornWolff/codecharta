import { Page } from "puppeteer"

export class NodeContextMenuPageObject {
	constructor(private page: Page) {}

	public async hasColorButtons() {
		return this.page.waitForSelector(".colorButton", {
			visible: true
		})
	}
}
