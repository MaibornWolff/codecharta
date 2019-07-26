import { Page } from "puppeteer"

export class SearchPanelPageObject {
	constructor(private page: Page) {}

	public async toggleTreeViewMode() {
		await this.page.click("#tree-view")
	}

	public async rightClickRootNodeInTreeViewSearchPanel() {
		await this.page.click("map-tree-view-level-component > .tree-root > .tree-element-label-0", { button: "right" })
	}

	public async hoverRootNodeInTreeViewSearchPanel() {
		await this.page.hover("map-tree-view-level-component > .tree-root > .tree-element-label-0")
	}
}
