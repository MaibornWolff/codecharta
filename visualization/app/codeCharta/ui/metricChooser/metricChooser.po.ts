export class MetricChooserPageObject {
	public async getAreaMetricValue(): Promise<number> {
		await page.waitForSelector("area-metric-chooser-component .metric-value")
		return await page.$eval("area-metric-chooser-component .metric-value", el => el["innerText"])
	}
}
