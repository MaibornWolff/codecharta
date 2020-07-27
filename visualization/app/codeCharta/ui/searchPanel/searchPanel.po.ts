import { Page } from "puppeteer"
import { click } from "../../../puppeteer.helper"

export class SearchPanelPageObject {
	private EXPANDED = "expanded"
	private TRANSITION_TIME = 500

	constructor(private page: Page) {}

	public async toggle() {
		await click("search-panel-component md-card .section .section-title")
		await this.page.waitFor(this.TRANSITION_TIME)
	}

	public async isOpen(): Promise<boolean> {
		const classNames = await this.page.$eval("search-panel-component md-card", el => el["className"])
		return classNames.includes(this.EXPANDED)
	}
}
