import { Page } from "puppeteer"
import { delay } from "../../../puppeteer.helper"

export class RibbonBarPageObject {
	constructor(private page: Page) {}

	public async getRibbonBarClassList(): Promise<string> {
		return await this.page.$eval("ribbon-bar-component md-card:last-child", el => el["className"])
	}

	public async toggle() {
		await this.page.click("ribbon-bar-component md-card:last-child .section-title")
		await delay(400)
	}

	public async getAreaMetricValue(): Promise<number> {
		return await this.page.$eval("area-metric-chooser-component .metric-value", el => el["innerText"])
	}
}
