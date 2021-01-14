export class LegendPanelObject {
	async open() {
		await expect(page).toClick("legend-panel-component panel-button", { timeout: 3000 })
		await page.waitForSelector("block-wrapper cc-shadow visible", { visible: true })
	}
}
