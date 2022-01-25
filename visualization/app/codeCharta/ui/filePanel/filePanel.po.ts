import { clickButtonOnPageElement } from "../../../puppeteer.helper"

export class FilePanelPageObject {
	async getSelectedName() {
		await page.waitForSelector("cc-file-panel cc-file-panel-file-selector .mat-select-value-text span")
		return page.$eval("cc-file-panel cc-file-panel-file-selector .mat-select-value-text span", element => element["innerText"])
	}

	async getAllNames() {
		await clickButtonOnPageElement("cc-file-panel cc-file-panel-file-selector mat-select")
		await page.waitForSelector(".mat-select-panel")
		const content = await page.$$eval(".mat-select-panel .mat-option-text", element => element.map(item => item["innerText"]))
		return content
	}
}
