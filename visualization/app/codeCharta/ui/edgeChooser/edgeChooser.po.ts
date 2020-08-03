export class EdgeChooserPageObject {
	public async open() {
		await expect(page).toClick("edge-chooser-component md-select", { timeout: 3000 })
		await page.waitForSelector(".md-select-menu-container.ribbonBarDropdown.md-active.md-clickable")
	}

	public async getMetrics() {
		await page.waitForSelector(".edge-metric")
		return await page.$$eval(".edge-metric", metrics => metrics.map(x => x.textContent))
	}

	public async selectEdgeMetric(metric: string) {
		await this.open()
		await expect(page).toClick(`#edge-metric-${metric}`, { timeout: 3000 })
	}

	public async isEdgeCountAvailable() {
		await page.waitForSelector("edge-chooser-component #edge-count")
		const innerText = await page.$eval("edge-chooser-component #edge-count", el => el["innerText"])

		function containsNumber(string: string): boolean {
			return /\d/.test(string)
		}

		return containsNumber(innerText)
	}
}
