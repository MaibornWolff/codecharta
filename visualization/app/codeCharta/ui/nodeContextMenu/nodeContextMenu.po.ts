import { waitForElementRemoval } from "../../../puppeteer.helper"

export class NodeContextMenuPageObject {
	public async hasColorButtons() {
		return page.waitForSelector(".colorButton", {
			visible: true
		})
	}

	public async exclude() {
		await page.click("#exclude-button")
		await waitForElementRemoval("#loading-gif-map")
	}
}
