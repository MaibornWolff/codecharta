export class MetricChooserPageObject {
	public async openHeightMetricChooser() {
		await expect(page).toClick("height-metric-chooser-component md-select", { timeout: 3000 })
		await page.waitForSelector(".md-select-menu-container.ribbonBarDropdown.md-active")
	}

	public async clickOnHeightMetricSearch() {
		await expect(page).toClick("md-backdrop", { button: "middle", timeout: 3000 })

		await expect(page).toClick(".metric-search.height-metric", { timeout: 3000 })
	}

	public async isMetricChooserVisible() {
		return page.waitForSelector(".md-select-menu-container.ribbonBarDropdown.md-active")
	}

	public async getAreaMetricValue(): Promise<number> {
		await page.waitForSelector("area-metric-chooser-component .metric-value")
		return await page.$eval("area-metric-chooser-component .metric-value", el => el["innerText"])
	}
}
