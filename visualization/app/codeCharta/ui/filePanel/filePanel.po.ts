import { Page } from "puppeteer"
import { click } from "../../../puppeteer.helper"

export class FilePanelPageObject {
	constructor(private page: Page) {}

	public async getSelectedName() {
		return await this.page.$eval("file-panel-component md-select .md-text", el => el["innerText"])
	}

	public async clickChooser() {
		await click("file-panel-component md-select")
	}

	public async getAllNames() {
		await this.clickChooser()

		await this.page.waitForSelector(".md-select-menu-container.md-active > md-select-menu")
		const content = await this.page.$eval(".md-select-menu-container.md-active > md-select-menu", el => el["innerText"])
		return content.split("\n")
	}
}
