import { Page } from "puppeteer"
import { click } from "../../../puppeteer.helper"

export class SearchPanelModeSelectorPageObject {
	private TRANSITION_TIME = 500

	constructor(private page: Page) {}

	public async toggleTreeView() {
		await click("#tree-view")
		await this.page.waitFor(this.TRANSITION_TIME)
	}

	public async isTreeViewOpen() {
		const classNames = await this.page.$eval("#tree-view", el => el.className)

		return classNames.includes("current")
	}
}
