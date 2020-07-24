import { Page } from "puppeteer"
import { delay } from "../../../puppeteer.helper"

export class SearchPanelModeSelectorPageObject {
	constructor(private page: Page) {}

	public async openTreeView() {
		await this.page.click("search-panel-mode-selector-component #tree-view")
		await delay(500)
	}
}
