export class LegendPanelObject {
	async open() {
		await expect(page).toClick("legend-panel-component panel-button", { timeout: 3000 })
		await page.waitForSelector("block-wrapper cc-shadow visible", { visible: true })
	}

	async checkNodeColor() {
		await page.waitForSelector("img[data:image/gif;base64,R0lGODlhAQABAPAAAB2O/////yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==]", {
			timeout: 3000
		})
	}
}
