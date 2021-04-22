import { EdgeMetricCount } from "../../codeCharta.model"
import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class EdgeChooserPageObject {
	async open() {
		await clickButtonOnPageElement("edge-chooser-component md-select")

		await page.waitForSelector("body > md-backdrop.md-select-backdrop.md-click-catcher.ng-scope")

		// await page.waitForFunction(
		// 	(selector: string) => getComputedStyle(document.querySelector(selector)).position === "fixed",
		// 	{},
		// 	"body > md-backdrop.md-select-backdrop.md-click-catcher.ng-scope"
		// )

		await page.waitForSelector(".md-select-menu-container.ribbonBarDropdown.md-active.md-clickable", { hidden: false })
	}

	async getMetrics() {
		await page.waitForSelector(".edge-metric")
		return page.$$eval(".edge-metric", metrics => metrics.map(x => x.textContent))
	}

	async selectEdgeMetric(metric: string) {
		await this.open()
		await clickButtonOnPageElement(`#edge-metric-${metric}`)
	}

	async isEdgeCountAvailable() {
		const innerText = await this.getEdgeCountInnerText()

		// Check if the text contains a number.
		return /\d/.test(innerText)
	}

	async getAmountOfEdges(): Promise<EdgeMetricCount> {
		const innerText = await this.getEdgeCountInnerText()
		const edgeCount = innerText.split("/")

		return { incoming: Number(edgeCount[0]), outgoing: Number(edgeCount[1]) }
	}

	private async getEdgeCountInnerText() {
		await page.waitForSelector("edge-chooser-component #edge-count")
		return page.$eval("edge-chooser-component #edge-count", element => element["innerText"])
	}
}
