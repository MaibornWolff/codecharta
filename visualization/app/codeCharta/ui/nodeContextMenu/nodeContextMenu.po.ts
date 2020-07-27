import { waitForElementRemoval } from "../../../puppeteer.helper"

export class NodeContextMenuPageObject {
	public async hasColorButtons() {
		return page.waitForSelector(".colorButton", {
			visible: true
		})
	}

	public async exclude() {
		await expect(page).toClick("#exclude-button")
		await waitForElementRemoval("#loading-gif-map")
	}
}
