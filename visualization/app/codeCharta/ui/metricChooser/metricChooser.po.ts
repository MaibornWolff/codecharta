export class MetricChooserPageObject {
	public async getAreaMetricValue(): Promise<number> {
		return await page.$eval("area-metric-chooser-component .metric-value", el => el["innerText"])
	}
}
