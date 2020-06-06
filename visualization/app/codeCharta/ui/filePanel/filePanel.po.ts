import { Page } from "puppeteer"

export class FilePanelPageObject {
	constructor(private page: Page) {}

	public async getSelectedName() {
		return await this.page.$eval("file-panel-component md-select .md-text", el => el["innerText"])
	}

	public async clickChooser() {
		return this.page.click("file-panel-component md-select")
	}

	public async getAllNames() {
		const content = await this.page.$eval(
			".md-select-menu-container.md-active > md-select-menu",
			el => el["innerText"]
		)
		return content.split("\n")
	}
}
