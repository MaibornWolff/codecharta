export class MetricChooserPageObject {
	async openHeightMetricChooser() {
		await expect(page).toClick("height-metric-chooser-component md-select", { timeout: 3000 })
		await page.waitForSelector(".md-select-menu-container.ribbonBarDropdown.md-active", { visible: true })
	}

	async clickOnHeightMetricSearch() {
		await expect(page).toClick(".metric-search.height-metric", { timeout: 3000 })
	}

	async isMetricChooserVisible() {
		return page.waitForSelector(".md-select-menu-container.ribbonBarDropdown.md-active", { visible: true })
	}

	async getAreaMetricValue(): Promise<number> {
		await page.waitForSelector("area-metric-chooser-component .metric-value")
		return page.$eval("area-metric-chooser-component .metric-value", element => element["innerText"])
	}
}
