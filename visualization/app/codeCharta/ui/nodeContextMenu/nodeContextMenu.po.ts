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
		const menu = await page.waitForSelector("#codemap-context-menu", { hidden: false })
		const isHidden = await menu.evaluate(element => { return element.getAttribute("aria-hidden") })

		return isHidden !== 'true'
	}

	async isClosed() {
		const menu = await page.waitForSelector("#codemap-context-menu", { hidden: true })
		const isHidden = await menu.evaluate(element => { return element.getAttribute("aria-hidden") })

		return isHidden === 'true'
	}
}
