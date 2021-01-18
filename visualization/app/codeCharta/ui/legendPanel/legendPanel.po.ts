export class LegendPanelObject {
	async open() {
		await expect(page).toClick("legend-panel-component .panel-button", { timeout: 3000 })
		await page.waitForSelector("legend-panel-component .block-wrapper", { visible: true })
	}

	async getMultipleFilenames() {
		return page.$$eval("legend-panel-component .block-wrapper .legend-block .marked-package", elements =>
			elements.map(x => x.textContent.replace(/[\n\r]+|\s{2,}/g, " ").trim())
		)
	}
	async getFilename() {
		return page.$eval("legend-panel-component .block-wrapper .legend-block .marked-package", element => element["innerText"])
	}

	async getEmptyLegendIfNoFilenamesExist() {
		return (await page.$("legend-panel-component .block-wrapper .legend-block .marked-package")) || ""
	}
}
