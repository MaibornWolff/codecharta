import { Page } from "puppeteer"
import { delay } from "../../../puppeteer.helper"

export class SearchPanelModeSelectorPageObject {
	constructor(private page: Page) {}

	public async toggleTreeView() {
		await this.page.click("#tree-view")
		await delay(500)
	}

	public async isTreeViewOpen() {
		const classNames = await this.page.$eval("#tree-view", el => el.className)

		return classNames.includes("current")
	}
}
