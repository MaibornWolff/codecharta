import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class MetricChooserPageObject {
	async openHeightMetricChooser() {
		await clickButtonOnPageElement("height-metric-chooser-component md-select")
		await page.waitForSelector(".md-select-menu-container.ribbonBarDropdown.md-active", { visible: true })
	}

	async clickOnHeightMetricSearch() {
		await clickButtonOnPageElement(".metric-search.height-metric")
	}

	async isMetricChooserVisible() {
		return page.waitForSelector(".md-select-menu-container.ribbonBarDropdown.md-active", { visible: true })
	}

	async getAreaMetricValue(): Promise<number> {
		await page.waitForSelector("area-metric-chooser-component .metric-value span")
		return page.$eval("area-metric-chooser-component .metric-value span", element => element["innerText"])
	}
}
