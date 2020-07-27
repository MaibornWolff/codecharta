import { Page } from "puppeteer"
import { waitForElementRemoval } from "../../../puppeteer.helper"

export class NodeContextMenuPageObject {
	constructor(private page: Page) {}

	public async hasColorButtons() {
		return this.page.waitForSelector(".colorButton", {
			visible: true
		})
	}

	public async exclude() {
		await this.page.click("#exclude-button")
		await waitForElementRemoval("#loading-gif-map")
	}
}
