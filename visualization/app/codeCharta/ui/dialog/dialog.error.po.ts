export class DialogErrorPageObject {
	async getMessage() {
		await page.waitForSelector(".md-dialog-content-body")
		return page.$eval(".md-dialog-content-body", element => element["innerText"])
	}

	async clickOk() {
		await expect(page).toClick("md-dialog-actions button", { timeout: 3000 })
		await page.waitForSelector("md-dialog-actions button", { visible: false })
	}

	async waitUntilDialogIsClosed() {
		await page.waitForSelector(".md-dialog-content-body")
		await page.waitForSelector(".md-dialog-content-body", { visible: false })
	}
}
