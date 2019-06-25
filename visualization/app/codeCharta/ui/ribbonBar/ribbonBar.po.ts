export class RibbonBarPageObject {
	constructor(private page) {}

	public async getRibbonBarClassList() {
		return await this.page.evaluate(() => document.querySelector("#header").classList)
	}

	public async toggle() {
		const selector = "#toggle-ribbon-bar-fab"
		return this.page.click(selector)
	}

	public async getAreaMetricValue() {
		return await this.page.evaluate(() => document.querySelector(".metric-value")["innerText"])
	}
}
