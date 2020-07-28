export class EdgeChooserPageObject {
	public async open() {
		await expect(page).toClick("edge-chooser-component md-select")
		await page.waitForSelector(".md-select-menu-container.ribbonBarDropdown.md-active.md-clickable")
	}

	public async getMetrics() {
		return await page.$$eval(".edge-metric", metrics => metrics.map(x => x.textContent))
	}
}
