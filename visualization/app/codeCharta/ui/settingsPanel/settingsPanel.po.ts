import { delay } from "../../../puppeteer.helper"

export class SettingsPanelPageObject {
	constructor(private page) {}

	public async open() {
		await this.page.click("#actionButtons > sidenav-toggle-component > button")
		await delay(500)
	}

	public async toggleTreeViewSearchPanel() {
		await this.page.click(
			"settings-panel-component > md-expansion-panel-group > md-expansion-panel:nth-child(1) > md-expansion-panel-collapsed"
		)
		await delay(500)
	}

	public async rightClickRootNodeInTreeViewSearchPanel() {
		await this.page.click(
			"sidenav-component map-tree-view-level-component > div > div.tree-element-label-0",
			{ button: "right" }
		)
		await delay(500)
	}
}
