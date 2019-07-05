import { Page } from "puppeteer"

export class RibbonBarPageObject {
	constructor(private page : Page) {}

	public async getRibbonBarClassList() {
		return await this.page.$eval("#header", el => el["className"])
	}

	public async toggle() {
		await this.page.click("#toggle-ribbon-bar-fab")
	}

	public async getAreaMetricValue() {
		return await this.page.$eval(".metric-value", el => el["innerText"])
	}
}
