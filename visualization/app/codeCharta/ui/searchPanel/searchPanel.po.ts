import { Page } from "puppeteer"
import { delay } from "../../../puppeteer.helper"

export class SearchPanelPageObject {
	private EXPANDED = "expanded"

	constructor(private page: Page) {}

	public async toggle() {
		await this.page.click("search-panel-component md-card .section .section-title")
		await delay(400)
	}

	public async isOpen(): Promise<boolean> {
		const classNames = await this.page.$eval("search-panel-component md-card", el => el["className"])
		return classNames.includes(this.EXPANDED)
	}

	public async rightClickRootNodeInTreeViewSearchPanel() {
		await this.page.click("map-tree-view-level-component > .tree-root > .tree-element-label-0", { button: "right" })
	}

	public async hoverRootNodeInTreeViewSearchPanel() {
		await this.page.hover("map-tree-view-level-component > .tree-root > .tree-element-label-0")
	}
}
