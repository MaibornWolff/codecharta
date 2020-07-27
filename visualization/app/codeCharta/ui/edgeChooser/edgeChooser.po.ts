import { click } from "../../../puppeteer.helper"

export class EdgeChooserPageObject {
	public async open() {
		await click("edge-chooser-component md-select")
	}

	public async getMetrics() {
		await page.waitFor(200)
		return await page.$$eval(".edge-metric", metrics => metrics.map(x => x.textContent))
	}
}
