export class NodeContextMenuPageObject {
	public async hasColorButtons() {
		return page.waitForSelector(".colorButton", {
			visible: true
		})
	}

	public async exclude() {
		await expect(page).toClick("#exclude-button", { timeout: 3000 })
		await page.waitForSelector("#loading-gif-map", { visible: false })
	}

	public async isClosed() {
		return page.waitForSelector("node-context-menu-component", { visible: false })
	}
}
