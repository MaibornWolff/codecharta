export class MetricChooserPageObject {
	async getAreaMetricValue(): Promise<number> {
		await page.waitForSelector("area-metric-chooser-component .metric-value")
		return page.$eval("area-metric-chooser-component .metric-value", element => element["innerText"])
	}
}
