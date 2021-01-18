export class DialogErrorPageObject {
	async getMessage() {
		await page.waitForSelector("md-dialog")
		return page.$eval(".md-dialog-content-body", element => element["innerText"])
	}

	async getMessage2() {
		await page.waitForSelector("md-dialog2")
		return page.$eval(".md-dialog-content-body", element => element["innerText"])
	}

	async clickOk() {
		await expect(page).toClick("md-dialog-actions button", { timeout: 3000 })
		await page.waitForSelector("md-dialog-actions button", { visible: false })
	}

	async waitUntilDialogIsClosed() {
		await expect(page).toClick("md-dialog-actions button", { timeout: 3000 })
		
		await page.waitForSelector("md-dialog-actions button", { visible: false })
		await page.waitForSelector(".md-dialog-content-body", { visible: false })
	}
}
