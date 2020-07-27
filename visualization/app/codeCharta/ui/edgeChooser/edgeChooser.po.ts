import { Page } from "puppeteer"
import { click } from "../../../puppeteer.helper"

export class EdgeChooserPageObject {
	constructor(private page: Page) {}

	public async open() {
		await click("edge-chooser-component md-select")
	}

	public async getMetrics() {
		await this.page.waitFor(200)
		return await this.page.$$eval(".edge-metric", metrics => metrics.map(x => x.textContent))
	}
}
