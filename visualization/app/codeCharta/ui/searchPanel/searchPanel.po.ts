import { delay } from "../../../puppeteer.helper"
import { Page } from "puppeteer"

export class SearchPanelPageObject {
	constructor(private page: Page) {}

	public async toggleTreeViewMode() {
		await this.page.click("#tree-view")
		await delay(500)
	}

	public async rightClickRootNodeInTreeViewSearchPanel() {
		await this.page.click("map-tree-view-level-component > div > div.tree-element-label-0", { button: "right" })
		await delay(500)
	}
}
