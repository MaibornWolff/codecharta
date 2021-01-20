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
		await expect(page).toClick("md-dialog-actions > button")
		await page.waitForSelector(".md-dialog-content-body", { hidden: true })
	}

	async waitUntilDialogIsClosed() {
		await expect(page).toClick("md-dialog-actions button")
		await page.waitForSelector("md-dialog-actions button", { visible: false })
		await page.waitForSelector(".md-dialog-content-body", { visible: false })
	}

	async waitUntilDialogContentChanges(oldContent : string) {
		await page.waitForFunction((argument) => {
			return !document.querySelector(".md-dialog-content-body")?.textContent.includes(argument)
		}, {}, oldContent)
	}
}
