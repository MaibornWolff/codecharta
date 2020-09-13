import { EdgeMetricCount } from "../../codeCharta.model"

export class EdgeChooserPageObject {
	public async open() {
		await expect(page).toClick("edge-chooser-component md-select", { timeout: 3000 })
		await page.waitForSelector(".md-select-menu-container.ribbonBarDropdown.md-active.md-clickable")
	}

	public async getMetrics() {
		await page.waitForSelector(".edge-metric")
		return page.$$eval(".edge-metric", metrics => metrics.map(x => x.textContent))
	}

	public async selectEdgeMetric(metric: string) {
		await this.open()
		await expect(page).toClick(`#edge-metric-${metric}`, { timeout: 3000 })
	}

	public async isEdgeCountAvailable() {
		const innerText = await this.getEdgeCountInnerText()

		// Check if the text contains a number.
		return /\d/.test(innerText)
	}

	public async getAmountOfEdges(): Promise<EdgeMetricCount> {
		const innerText = await this.getEdgeCountInnerText()
		const edgeCount = innerText.split("/")

		return { incoming: Number(edgeCount[0]), outgoing: Number(edgeCount[1]) }
	}

	private async getEdgeCountInnerText() {
		await page.waitForSelector("edge-chooser-component #edge-count")
		return page.$eval("edge-chooser-component #edge-count", element => element["innerText"])
	}
}
