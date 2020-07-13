import { Page } from "puppeteer"
import { delay } from "../../../puppeteer.helper"

export class NodeContextMenuPageObject {
	constructor(private page: Page) {}

	public async hasColorButtons() {
		return this.page.waitForSelector(".colorButton", {
			visible: true
		})
	}

	public async exclude() {
		this.page.click("#exclude-button")
		await delay(300)
	}
}
