import { Page } from "puppeteer"

export class MapTreeViewLevelPageObject {
	constructor(private page: Page) {}

	public async openContextMenu() {
		await this.page.click("[id='/root/ParentLeaf']")
		await this.page.click("[id='/root/ParentLeaf/smallLeaf.html']", { button: "right" })
	}

	public async hoverNode() {
		await this.page.click("[id='/root/ParentLeaf']")
		await this.page.hover("[id='/root/ParentLeaf/smallLeaf.html']")
	}

	public async nodeExists() {
		return !!(await this.page.$("[id='/root/ParentLeaf/smallLeaf.html']"))
	}
}
