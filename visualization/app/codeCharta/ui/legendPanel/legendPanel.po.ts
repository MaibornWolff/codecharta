import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class LegendPanelObject {
	async open() {
		await clickButtonOnPageElement("legend-panel-component .panel-button")
		await page.waitForSelector("legend-panel-component .block-wrapper", { visible: true })
	}

	async getMultipleFilenames() {
		return page.$$eval("legend-panel-component cc-legend-marked-packages cc-labelled-color-picker", elements =>
			elements.map(x => x.textContent.trim())
		)
	}
	async getFilename() {
		return page.$eval("legend-panel-component cc-legend-marked-packages cc-labelled-color-picker", element => {
			return element["innerText"]
		})
	}

	async getEmptyLegendIfNoFilenamesExist() {
		return page.$eval("legend-panel-component cc-legend-marked-packages", element => element["innerText"])
	}
}
