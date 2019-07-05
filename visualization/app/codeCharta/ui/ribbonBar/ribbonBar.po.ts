import { Page } from "puppeteer"
import { delay } from "../../../puppeteer.helper"

export class RibbonBarPageObject {
	constructor(private page : Page) {}

	public async getRibbonBarClassList() {
		return await this.page.$eval("#header", el => el["className"])
	}

	public async toggle() {
		await this.page.click("#toggle-ribbon-bar-fab")
		await delay(500)
	}

	public async getAreaMetricValue() {
		return await this.page.$eval(".metric-value", el => el["innerText"])
	}
}
