export class DialogErrorPageObject {
	public async getMessage() {
		await page.waitForSelector(".md-dialog-content-body")
		return await page.$eval(".md-dialog-content-body", el => el["innerText"])
	}

	public async clickOk() {
		await expect(page).toClick("md-dialog-actions button", { timeout: 3000 })
		await page.waitForSelector("md-dialog-actions button", { visible: false })
	}

	public async waitUntilDialogIsClosed() {
		await page.waitForSelector(".md-dialog-content-body")
		await page.waitForSelector(".md-dialog-content-body", { visible: false })
	}
}
