import { Page } from "puppeteer"

export class SearchPanelModeSelectorPageObject {
	constructor(private page: Page) {}

	public async openTreeView() {
		await this.page.click("search-panel-mode-selector-component #tree-view")
	}
}
