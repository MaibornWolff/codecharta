import { waitForElementRemoval } from "../../../puppeteer.helper"

export class DialogErrorPageObject {
	public async getMessage() {
		return await page.$eval(".md-dialog-content-body", el => el["innerText"])
	}

	public async clickOk() {
		await expect(page).toClick("md-dialog-actions button")

		await waitForElementRemoval("md-dialog-actions button")
	}
}
