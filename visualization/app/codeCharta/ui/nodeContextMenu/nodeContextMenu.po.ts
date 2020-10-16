export class NodeContextMenuPageObject {
	async hasColorButtons() {
		return page.waitForSelector(".colorButton", {
			visible: true
		})
	}

	async exclude() {
		await expect(page).toClick("#exclude-button", { timeout: 3000 })
		await page.waitForSelector("#loading-gif-map", { visible: false })
	}

	async isOpened() {
		await page.waitForSelector("#codemap-context-menu", { visible: true })
	}

	async isClosed() {
		await page.waitForSelector("#codemap-context-menu", { hidden: true })
	}
}
