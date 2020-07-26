import { Page } from "puppeteer"
import { delay } from "../../../puppeteer.helper"

export class EdgeChooserPageObject {
	constructor(private page: Page) {}

	public async open() {
		await this.page.click("edge-chooser-component md-select")
		await delay(300)
	}

	public async getMetrics() {
		return await this.page.$$eval(".edge-metric", metrics => metrics.map(x => x.textContent))
	}

	public async selectEdgeMetric(metric: string) {
		await this.open()
		await this.page.click(`#edge-metric-${metric}`)
	}

	public async isEdgeCountAvailable() {
		const innerText = await this.page.$eval("edge-chooser-component #edge-count", el => el["innerText"])

		function containsNumber(string: string): boolean {
			return /\d/.test(string)
		}

		return containsNumber(innerText)
	}
}
