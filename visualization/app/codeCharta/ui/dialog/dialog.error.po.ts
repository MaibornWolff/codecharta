export class DialogErrorPageObject {
	async getMessage() {
		await page.waitForSelector(".md-dialog-content-body")
		return page.$eval(".md-dialog-content-body", element => element["innerText"])
	}

	async clickOk() {
		await expect(page).toClick("md-dialog-actions button", { timeout: 3000 })
		await page.waitForSelector("md-dialog-actions button", { visible: false })
	}

	async clickOkAndReturnWhenFullyClosed() {
		await expect(page).toClick("md-dialog-actions button")
		await page.waitForFunction(() => !document.querySelector(".md-dialog-content-body"))
	}

	async clickAndWaitUntilContentChange() {
		const message=await this.getMessage()
		await expect(page).toClick("md-dialog-actions > button")

		await page.waitForFunction((argument) => !document.querySelector(".md-dialog-content-body")?.textContent.includes(argument),
		{}, message)
	}
}