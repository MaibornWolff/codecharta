export class EdgeChooserPageObject {
	public async open() {
		await expect(page).toClick("edge-chooser-component md-select")
	}

	public async getMetrics() {
		await page.waitFor(200)
		return await page.$$eval(".edge-metric", metrics => metrics.map(x => x.textContent))
	}
}
