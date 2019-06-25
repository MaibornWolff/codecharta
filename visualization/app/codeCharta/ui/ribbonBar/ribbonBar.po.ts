import { delay } from "../../../puppeteer.helper"

export class RibbonBarPageObject {
	constructor(private page) {}

	public async getRibbonBarClassList() {
		return await this.page.evaluate(() => document.querySelector("#header").classList)
	}

	public async toggle() {
		const selector = "#toggle-ribbon-bar-fab"
		this.page.click(selector)
		await delay(1000)
	}

	public async getAreaMetricValue() {
		return await this.page.evaluate(() => document.querySelector(".metric-value")["innerText"])
	}
}
