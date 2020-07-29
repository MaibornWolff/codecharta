import { Page } from "puppeteer"

export class MetricChooserPageObject {
	constructor(private page: Page) {}

	public async getAreaMetricValue(): Promise<number> {
		return await this.page.$eval("area-metric-chooser-component .metric-value", el => el["innerText"])
	}
}
